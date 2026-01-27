import express from "express";
import defaults, { createDefaultScenario } from "../stateDefaults.js";

const router = express.Router();
const isProduction = process.env.NODE_ENV === "production";
const sessionCookieName = "cvs.sid";

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

function ensureStore(req) {
  if (!req.session) {
    return null;
  }
  if (!req.session.workspaces) {
    req.session.workspaces = {};
  }
  return req.session.workspaces;
}

router.get("/", async (req, res) => {
  try {
    const userId = getUserId(req);
    const store = ensureStore(req);
    if (!store) {
      return res.status(500).json({ message: "Session unavailable" });
    }
    let workspace = store[userId];

    if (!workspace) {
      workspace = { ...defaults, userId };
      store[userId] = workspace;
      return res.json(workspace);
    }

    if (!workspace.scenarios || workspace.scenarios.length === 0) {
      const migrated = normalizePayload(workspace);
      workspace = { ...migrated, userId };
      store[userId] = workspace;
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
    const store = ensureStore(req);
    if (!store) {
      return res.status(500).json({ message: "Session unavailable" });
    }
    const workspace = { ...payload, userId };
    store[userId] = workspace;

    res.json(workspace);
  } catch (error) {
    res.status(500).json({ message: "Failed to save state" });
  }
});

router.delete("/", (req, res) => {
  const store = ensureStore(req);
  if (!store) {
    return res.status(500).json({ message: "Session unavailable" });
  }
  if (req.query.user) {
    const userId = getUserId(req);
    delete store[userId];
    return res.status(204).end();
  }
  return req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({ message: "Failed to reset state" });
    }
    res.clearCookie(sessionCookieName, {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction
    });
    return res.status(204).end();
  });
});

export default router;
