import express from "express";
import { Workspace } from "../models/Workspace.js";
import defaults, { createDefaultScenario } from "../stateDefaults.js";

const router = express.Router();

function getUserId(req) {
  return (req.query.user || "default").toString().trim() || "default";
}

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
    const userId = getUserId(req);
    let workspace = await Workspace.findOne({ userId });
    if (!workspace && userId === "default") {
      workspace = await Workspace.findOne({ userId: { $exists: false } });
      if (workspace) {
        workspace.userId = "default";
        await workspace.save();
      }
    }
    if (!workspace) {
      workspace = await Workspace.create({ ...defaults, userId });
      return res.json(workspace);
    }

    if (!workspace.scenarios || workspace.scenarios.length === 0) {
      const migrated = normalizePayload(workspace.toObject());
      workspace = await Workspace.findOneAndUpdate({ userId }, migrated, {
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
    const userId = getUserId(req);
    const payload = normalizePayload(req.body);
    const workspace = await Workspace.findOneAndUpdate(
      { userId },
      { ...payload, userId },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    res.json(workspace);
  } catch (error) {
    res.status(500).json({ message: "Failed to save state" });
  }
});

export default router;
