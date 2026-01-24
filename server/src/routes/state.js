import express from "express";
import { Workspace } from "../models/Workspace.js";
import defaults, { createDefaultScenario } from "../stateDefaults.js";

const router = express.Router();

function normalizePayload(payload) {
  if (!payload) {
    return defaults;
  }

  if (Array.isArray(payload.scenarios) && payload.scenarios.length > 0) {
    return {
      scenarios: payload.scenarios,
      activeScenarioId: payload.activeScenarioId || payload.scenarios[0].id
    };
  }

  const scenario = createDefaultScenario();
  return {
    scenarios: [
      {
        ...scenario,
        categories: payload.categories ?? scenario.categories,
        cards: payload.cards ?? scenario.cards,
        spend: payload.spend ?? scenario.spend,
        assignments: payload.assignments ?? scenario.assignments,
        spendInterval: payload.spendInterval ?? scenario.spendInterval
      }
    ],
    activeScenarioId: scenario.id
  };
}

router.get("/", async (req, res) => {
  try {
    let workspace = await Workspace.findOne();
    if (!workspace) {
      workspace = await Workspace.create(defaults);
      return res.json(workspace);
    }

    if (!workspace.scenarios || workspace.scenarios.length === 0) {
      const migrated = normalizePayload(workspace.toObject());
      workspace = await Workspace.findOneAndUpdate({}, migrated, {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      });
    }

    res.json(workspace);
  } catch (error) {
    res.status(500).json({ message: "Failed to load state" });
  }
});

router.put("/", async (req, res) => {
  try {
    const payload = normalizePayload(req.body);
    const workspace = await Workspace.findOneAndUpdate({}, payload, {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true
    });

    res.json(workspace);
  } catch (error) {
    res.status(500).json({ message: "Failed to save state" });
  }
});

export default router;
