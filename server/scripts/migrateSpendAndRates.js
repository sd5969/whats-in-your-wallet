import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectToDatabase } from "../src/db.js";
import { Workspace } from "../src/models/Workspace.js";
import defaults from "../src/stateDefaults.js";

dotenv.config();

function normalizeSpend(spend) {
  if (!spend) {
    return { ...defaults.scenarios[0].spend };
  }

  const entries = spend instanceof Map ? Array.from(spend.entries()) : Object.entries(spend);
  return entries.reduce((acc, [key, value]) => {
    const numeric = Number(value);
    acc[key] = Number.isNaN(numeric) ? 0 : numeric;
    return acc;
  }, {});
}

function splitLegacyTravel(spend) {
  if (spend.flights !== undefined || spend.travelOther !== undefined) {
    return spend;
  }
  const travelValue = Number(spend.travel || 0);
  return {
    ...spend,
    flights: travelValue / 2,
    travelOther: travelValue / 2
  };
}

function applyDefaults(spend) {
  return Object.keys(defaults.scenarios[0].spend).reduce((acc, key) => {
    acc[key] = spend[key] ?? defaults.scenarios[0].spend[key];
    return acc;
  }, {});
}

function normalizeRates(rates, categoryKeys) {
  if (!rates) {
    return {};
  }
  const entries = rates instanceof Map ? Array.from(rates.entries()) : Object.entries(rates);
  return entries.reduce((acc, [key, value]) => {
    if (!categoryKeys.includes(key)) {
      return acc;
    }
    const numeric = Number(value);
    acc[key] = Number.isNaN(numeric) ? 0 : numeric;
    return acc;
  }, {});
}

function migrateRates(rates, categoryKeys) {
  const normalized = normalizeRates(rates, [...categoryKeys, "travel"]);
  if (normalized.travel !== undefined) {
    normalized.flights = normalized.flights ?? normalized.travel;
    normalized.travelOther = normalized.travelOther ?? normalized.travel;
    delete normalized.travel;
  }
  return categoryKeys.reduce((acc, key) => {
    if (normalized[key] !== undefined) {
      acc[key] = normalized[key];
    }
    return acc;
  }, {});
}

async function migrateSpendAndRates() {
  await connectToDatabase(process.env.MONGODB_URI);

  const workspace = await Workspace.findOne().lean();
  if (!workspace) {
    throw new Error("No workspace found to migrate.");
  }

  const baseScenario = defaults.scenarios[0];
  const categoryKeys = baseScenario.categories.map((category) => category.key);

  let spend = splitLegacyTravel(normalizeSpend(workspace.spend));
  if (workspace.spendInterval === "monthly") {
    spend = Object.fromEntries(
      Object.entries(spend).map(([key, value]) => [key, value * 12])
    );
  }

  const existingRates = (workspace.cards || []).reduce((acc, card) => {
    acc[card.id] = migrateRates(card.rates, categoryKeys);
    return acc;
  }, {});

  const updatedCards = baseScenario.cards.map((card) => {
    const overrides = existingRates[card.id] || {};
    const mergedRates = categoryKeys.reduce((acc, key) => {
      acc[key] = overrides[key] ?? card.rates[key] ?? 0;
      return acc;
    }, {});

    return {
      ...card,
      rates: mergedRates
    };
  });

  const updated = {
    scenarios: [
      {
        ...baseScenario,
        cards: updatedCards,
        spend: applyDefaults(spend),
        spendInterval: "annual"
      }
    ],
    activeScenarioId: baseScenario.id
  };

  const saved = await Workspace.findOneAndUpdate({}, updated, {
    new: true,
    upsert: true,
    runValidators: true,
    setDefaultsOnInsert: true
  }).lean();

  console.log(`Migrated spend + rates into workspace ${saved?._id || ""}`.trim());
}

migrateSpendAndRates()
  .then(async () => {
    await mongoose.disconnect();
  })
  .catch(async (error) => {
    console.error("Failed to migrate spend + rates", error);
    await mongoose.disconnect();
    process.exit(1);
  });
