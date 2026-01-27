const categories = [
  { key: "dining", label: "Dining" },
  { key: "groceries", label: "Groceries" },
  { key: "flights", label: "Flights (via portal)" },
  { key: "travelOther", label: "Other travel" },
  { key: "rent", label: "Rent" },
  { key: "gas", label: "Gas" },
  { key: "streaming", label: "Streaming" },
  { key: "amazon", label: "Amazon" },
  { key: "misc", label: "Everything Else" }
];

const cards = [
  {
    id: "bilt-blue",
    name: "Bilt 2.0 Blue",
    annualFee: 0,
    cpp: 0.015,
    rates: {
      rent: 0,
      dining: 1,
      groceries: 1,
      flights: 1,
      travelOther: 1,
      gas: 1,
      streaming: 1,
      amazon: 1,
      misc: 1
    },
    benefits: [
      {
        id: "bilt-protect",
        label: "No foreign transaction fees",
        value: 0,
        enabled: true
      }
    ]
  },
  {
    id: "bilt-obsidian",
    name: "Bilt 2.0 Obsidian",
    annualFee: 95,
    cpp: 0.015,
    rates: {
      rent: 0,
      dining: 3,
      groceries: 1,
      flights: 2,
      travelOther: 2,
      gas: 1,
      streaming: 1,
      amazon: 1,
      misc: 1
    },
    benefits: [
      {
        id: "bilt-protect-obsidian",
        label: "$100 annual Bilt Travel hotel credits",
        value: 100,
        enabled: false
      },
      {
        id: "bilt-nftf-obsidian",
        label: "No foreign transaction fees",
        value: 0,
        enabled: true
      }
    ]
  },
  {
    id: "bilt-palladium",
    name: "Bilt 2.0 Palladium",
    annualFee: 495,
    cpp: 0.015,
    rates: {
      rent: 0,
      dining: 2,
      groceries: 2,
      flights: 2,
      travelOther: 2,
      gas: 2,
      streaming: 2,
      amazon: 2,
      misc: 2
    },
    benefits: [
      {
        id: "bilt-hotel-palladium",
        label: "$400 annual Bilt Travel hotel credits",
        value: 400,
        enabled: false
      },
      {
        id: "bilt-protect-palladium",
        label: "Priority Pass lounge access",
        value: 200,
        enabled: false
      },
      {
        id: "bilt-nftf-palladium",
        label: "No foreign transaction fees",
        value: 0,
        enabled: true
      }
    ]
  },
  {
    id: "amex-gold",
    name: "Amex Gold",
    annualFee: 325,
    cpp: 0.018,
    rates: {
      rent: 0,
      dining: 4,
      groceries: 4,
      flights: 3,
      travelOther: 1,
      gas: 1,
      streaming: 1,
      amazon: 1,
      misc: 1
    },
    benefits: [
      { id: "amex-dining", label: "Dining credits", value: 120, enabled: false },
      { id: "amex-uber", label: "Uber Cash", value: 120, enabled: false },
      { id: "amex-nftf", label: "No foreign transaction fees", value: 0, enabled: true }
    ]
  },
  {
    id: "venture-x",
    name: "Capital One Venture X",
    annualFee: 395,
    cpp: 0.015,
    rates: {
      rent: 0,
      dining: 2,
      groceries: 2,
      flights: 5,
      travelOther: 2,
      gas: 2,
      streaming: 2,
      amazon: 2,
      misc: 2
    },
    benefits: [
      { id: "vx-credit", label: "Annual travel credit", value: 300, enabled: true },
      { id: "vx-bonus", label: "Anniversary miles", value: 100, enabled: true },
      { id: "vx-lounge", label: "Capital One and Priority Pass lounge access", value: 200, enabled: false },
      { id: "vx-nftf", label: "No foreign transaction fees", value: 0, enabled: true }
    ]
  },
  {
    id: "csp",
    name: "Chase Sapphire Preferred",
    annualFee: 95,
    cpp: 0.015,
    rates: {
      rent: 0,
      dining: 3,
      groceries: 1,
      flights: 2,
      travelOther: 2,
      gas: 1,
      streaming: 3,
      amazon: 1,
      misc: 1
    },
    benefits: [
      { id: "csp-hotel", label: "Annual hotel credit", value: 50, enabled: false },
      { id: "csp-dash", label: "DashPass value", value: 96, enabled: false },
      { id: "csp-nftf", label: "No foreign transaction fees", value: 0, enabled: true }
    ]
  },
  {
    id: "apple-card",
    name: "Apple Card",
    annualFee: 0,
    cpp: 0.01,
    rates: {
      rent: 0,
      dining: 2,
      groceries: 2,
      flights: 2,
      travelOther: 2,
      gas: 2,
      streaming: 2,
      amazon: 2,
      misc: 2
    },
    benefits: [
      { id: "apple-nftf", label: "No foreign transaction fees", value: 0, enabled: true }
    ]
  },
  {
    id: "robinhood-gold",
    name: "Robinhood Gold Card",
    annualFee: 0,
    cpp: 0.01,
    rates: {
      rent: 0,
      dining: 3,
      groceries: 3,
      flights: 3,
      travelOther: 3,
      gas: 3,
      streaming: 3,
      amazon: 3,
      misc: 3
    },
    benefits: [
      { id: "rh-no-ftf", label: "No foreign transaction fees", value: 0, enabled: true },
      { id: "rh-gold-fee", label: "Gold annual fee", value: -50, enabled: true }
    ]
  },
  {
    id: "amazon-prime-visa",
    name: "Amazon Prime Visa",
    annualFee: 0,
    cpp: 0.01,
    rates: {
      rent: 0,
      dining: 2,
      groceries: 1,
      flights: 1,
      travelOther: 1,
      gas: 2,
      streaming: 1,
      amazon: 5,
      misc: 1
    },
    benefits: [
      { id: "amazon-prime", label: "Amazon Prime", value: -139, enabled: true },
      { id: "amazon-nftf", label: "No foreign transaction fees", value: 0, enabled: true }
    ]
  }
];

const spend = {
  dining: 10100,
  groceries: 1200,
  flights: 3500,
  travelOther: 3500,
  rent: 49500,
  gas: 300,
  streaming: 0,
  amazon: 2000,
  misc: 12200
};

const assignments = categories.reduce((acc, category) => {
  acc[category.key] = [{ cardId: cards[0].id, share: 100 }];
  return acc;
}, {});

const scenario = {
  id: "default",
  name: "Default scenario",
  favorite: false,
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
