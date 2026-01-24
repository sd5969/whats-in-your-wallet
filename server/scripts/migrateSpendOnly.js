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

async function migrateSpendOnly() {
  await connectToDatabase(process.env.MONGODB_URI);

  const workspace = await Workspace.findOne().lean();
  if (!workspace) {
    throw new Error("No workspace found to migrate.");
  }

  let spend = splitLegacyTravel(normalizeSpend(workspace.spend));
  if (workspace.spendInterval === "monthly") {
    spend = Object.fromEntries(
      Object.entries(spend).map(([key, value]) => [key, value * 12])
    );
  }

  const baseScenario = defaults.scenarios[0];
  const updated = {
    scenarios: [
      {
        ...baseScenario,
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

  console.log(`Migrated spend-only into workspace ${saved?._id || ""}`.trim());
}

migrateSpendOnly()
  .then(async () => {
    await mongoose.disconnect();
  })
  .catch(async (error) => {
    console.error("Failed to migrate spend-only", error);
    await mongoose.disconnect();
    process.exit(1);
  });
