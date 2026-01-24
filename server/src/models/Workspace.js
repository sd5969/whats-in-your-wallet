import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true }
  },
  { _id: false }
);

const benefitSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    value: { type: Number, default: 0 },
    enabled: { type: Boolean, default: true }
  },
  { _id: false }
);

const assignmentSchema = new mongoose.Schema(
  {
    cardId: { type: String, required: true },
    share: { type: Number, default: 0 }
  },
  { _id: false }
);

const cardSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    annualFee: { type: Number, default: 0 },
    cpp: { type: Number, default: 0.01 },
    rates: { type: Map, of: Number, default: {} },
    benefits: { type: [benefitSchema], default: [] }
  },
  { _id: false }
);

const scenarioSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    categories: { type: [categorySchema], default: [] },
    cards: { type: [cardSchema], default: [] },
    spend: { type: Map, of: Number, default: {} },
    assignments: { type: Map, of: [assignmentSchema], default: {} },
    spendInterval: { type: String, default: "annual" }
  },
  { _id: false }
);

const workspaceSchema = new mongoose.Schema(
  {
    scenarios: { type: [scenarioSchema], default: [] },
    activeScenarioId: { type: String, default: "" }
  },
  {
    timestamps: true,
    minimize: false
  }
);

export const Workspace = mongoose.model("Workspace", workspaceSchema);
