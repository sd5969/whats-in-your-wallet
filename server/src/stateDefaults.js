const categories = [
  { key: "dining", label: "Dining" },
  { key: "groceries", label: "Groceries" },
  { key: "flights", label: "Flights" },
  { key: "travelOther", label: "Other travel" },
  { key: "rent", label: "Rent" },
  { key: "gas", label: "Gas" },
  { key: "streaming", label: "Streaming" },
  { key: "misc", label: "Everything Else" }
];

const cards = [
  {
    id: "bilt-blue",
    name: "Bilt 2.0 Blue",
    annualFee: 0,
    cpp: 0.015,
    rates: {
      rent: 1,
      dining: 3,
      groceries: 2,
      flights: 2,
      travelOther: 2,
      gas: 1,
      streaming: 1,
      misc: 1
    },
    benefits: [
      { id: "bilt-rent", label: "Rent Day bonuses", value: 120, enabled: true },
      { id: "bilt-protect", label: "Cell phone protection", value: 120, enabled: false },
      { id: "bilt-trip", label: "Trip protections", value: 80, enabled: false }
    ]
  },
  {
    id: "bilt-obsidian",
    name: "Bilt 2.0 Obsidian",
    annualFee: 95,
    cpp: 0.015,
    rates: {
      rent: 1,
      dining: 3,
      groceries: 2,
      flights: 2,
      travelOther: 2,
      gas: 1,
      streaming: 1,
      misc: 1
    },
    benefits: [
      { id: "bilt-rent-obsidian", label: "Rent Day bonuses", value: 120, enabled: true },
      { id: "bilt-protect-obsidian", label: "Cell phone protection", value: 120, enabled: false },
      { id: "bilt-trip-obsidian", label: "Trip protections", value: 80, enabled: false }
    ]
  },
  {
    id: "bilt-palladium",
    name: "Bilt 2.0 Palladium",
    annualFee: 495,
    cpp: 0.015,
    rates: {
      rent: 1,
      dining: 3,
      groceries: 2,
      flights: 2,
      travelOther: 2,
      gas: 1,
      streaming: 1,
      misc: 1
    },
    benefits: [
      { id: "bilt-rent-palladium", label: "Rent Day bonuses", value: 120, enabled: true },
      { id: "bilt-protect-palladium", label: "Cell phone protection", value: 120, enabled: false },
      { id: "bilt-trip-palladium", label: "Trip protections", value: 80, enabled: false }
    ]
  },
  {
    id: "amex-gold",
    name: "Amex Gold",
    annualFee: 250,
    cpp: 0.018,
    rates: {
      rent: 1,
      dining: 4,
      groceries: 4,
      flights: 3,
      travelOther: 1,
      gas: 1,
      streaming: 1,
      misc: 1
    },
    benefits: [
      { id: "amex-dining", label: "Dining credits", value: 120, enabled: true },
      { id: "amex-uber", label: "Uber Cash", value: 120, enabled: true }
    ]
  },
  {
    id: "venture-x",
    name: "Capital One Venture X",
    annualFee: 395,
    cpp: 0.015,
    rates: {
      rent: 1,
      dining: 2,
      groceries: 2,
      flights: 5,
      travelOther: 5,
      gas: 2,
      streaming: 2,
      misc: 2
    },
    benefits: [
      { id: "vx-credit", label: "Annual travel credit", value: 300, enabled: true },
      { id: "vx-bonus", label: "Anniversary miles", value: 100, enabled: true },
      { id: "vx-lounge", label: "Lounge access", value: 0, enabled: false }
    ]
  },
  {
    id: "csp",
    name: "Chase Sapphire Preferred",
    annualFee: 95,
    cpp: 0.015,
    rates: {
      rent: 1,
      dining: 3,
      groceries: 3,
      flights: 2,
      travelOther: 2,
      gas: 1,
      streaming: 3,
      misc: 1
    },
    benefits: [
      { id: "csp-hotel", label: "Annual hotel credit", value: 50, enabled: true },
      { id: "csp-dash", label: "DashPass value", value: 96, enabled: false }
    ]
  },
  {
    id: "apple-card",
    name: "Apple Card",
    annualFee: 0,
    cpp: 0.01,
    rates: {
      rent: 1,
      dining: 2,
      groceries: 2,
      flights: 2,
      travelOther: 2,
      gas: 2,
      streaming: 2,
      misc: 1
    },
    benefits: [
      { id: "apple-daily", label: "Daily Cash (Apple Pay)", value: 0, enabled: true }
    ]
  }
];

const spend = {
  dining: 4200,
  groceries: 5200,
  flights: 1900,
  travelOther: 1900,
  rent: 18000,
  gas: 1400,
  streaming: 600,
  misc: 7200
};

const assignments = categories.reduce((acc, category) => {
  acc[category.key] = [{ cardId: cards[0].id, share: 100 }];
  return acc;
}, {});

const scenario = {
  id: "default",
  name: "Default scenario",
  categories,
  cards,
  spend,
  assignments,
  spendInterval: "annual"
};

const defaults = {
  scenarios: [scenario],
  activeScenarioId: scenario.id
};

export function createDefaultScenario() {
  return {
    ...scenario,
    id: `scenario-${Date.now()}`
  };
}

export default defaults;
