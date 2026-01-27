import { useEffect, useMemo, useRef, useState } from "react";
import { fetchState, resetState, saveState } from "./api.js";

const initialCategories = [
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

const initialCards = [
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

const defaultSpend = {
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

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });
}

function clampNumber(value) {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return 0;
  }
  return Math.max(0, numeric);
}

function clampSignedNumber(value) {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return 0;
  }
  return numeric;
}

function parseNumberInput(value) {
  if (value === "") {
    return "";
  }
  return clampNumber(value);
}

function parseSpendInput(value) {
  if (value === "") {
    return "";
  }
  return clampNumber(value);
}

function parseNumberString(value) {
  return value.replace(/,/g, "");
}

function formatNumberInput(value) {
  if (value === "") {
    return "";
  }
  return Number(value || 0).toLocaleString("en-US");
}

function normalizeSpend(spend) {
  return Object.fromEntries(
    Object.entries(spend).map(([key, value]) => [key, clampNumber(value)])
  );
}

function normalizeCards(cards, categories) {
  const rateKeys = categories.map((category) => category.key);
  return cards.map((card) => ({
    ...card,
    annualFee: clampNumber(card.annualFee),
    cpp: clampNumber(card.cpp),
    rates: rateKeys.reduce((acc, key) => {
      const fallbackRate =
        key === "amazon" ? card.rates?.amazon ?? card.rates?.misc : card.rates?.[key];
      acc[key] = clampNumber(fallbackRate ?? 0);
      return acc;
    }, {}),
    benefits: card.benefits.map((benefit) => ({
      ...benefit,
      value: clampSignedNumber(benefit.value)
    }))
  }));
}

function normalizeAssignments(categories, assignments, cards) {
  const cardIds = new Set(cards.map((card) => card.id));
  return categories.reduce((acc, category) => {
    const splits = assignments?.[category.key];
    if (!Array.isArray(splits) || splits.length === 0) {
      acc[category.key] = [{ cardId: cards[0]?.id || "", share: 100 }];
      return acc;
    }
    acc[category.key] = splits
      .filter((split) => split.cardId && cardIds.has(split.cardId))
      .map((split) => ({
        cardId: split.cardId,
        share: clampNumber(split.share)
      }));
    if (acc[category.key].length === 0) {
      acc[category.key] = [{ cardId: cards[0]?.id || "", share: 100 }];
    }
    return acc;
  }, {});
}

function migrateTravelSpend(spend) {
  if (!spend || (spend.flights !== undefined && spend.travelOther !== undefined)) {
    return spend;
  }
  const travelValue = Number(spend.travel || 0);
  return {
    ...spend,
    flights: spend.flights ?? travelValue / 2,
    travelOther: spend.travelOther ?? travelValue / 2
  };
}

function migrateTravelAssignments(assignments) {
  if (
    !assignments ||
    (assignments.flights !== undefined && assignments.travelOther !== undefined)
  ) {
    return assignments;
  }
  return {
    ...assignments,
    flights: assignments.flights ?? assignments.travel,
    travelOther: assignments.travelOther ?? assignments.travel
  };
}

function migrateCardRates(cards) {
  return cards.map((card) => {
    let updated = false;
    const rates = { ...(card.rates || {}) };
    if (rates.travel !== undefined) {
      rates.flights = rates.flights ?? rates.travel;
      rates.travelOther = rates.travelOther ?? rates.travel;
      delete rates.travel;
      updated = true;
    }
    if (rates.amazon === undefined && rates.misc !== undefined) {
      rates.amazon = rates.misc;
      updated = true;
    }
    if (!updated) {
      return card;
    }
    return {
      ...card,
      rates
    };
  });
}

function mergeCardBenefits(cards) {
  const defaultsById = new Map(
    initialCards.map((card) => [card.id, card.benefits || []])
  );
  return cards.map((card) => {
    const defaults = defaultsById.get(card.id);
    if (!defaults) {
      return card;
    }
    const existing = new Map(
      (card.benefits || []).map((benefit) => [benefit.id, benefit])
    );
    const merged = defaults.map((benefit) =>
      existing.get(benefit.id) ?? benefit
    );
    const extras = (card.benefits || []).filter(
      (benefit) => !merged.some((entry) => entry.id === benefit.id)
    );
    return {
      ...card,
      benefits: [...merged, ...extras]
    };
  });
}

function normalizeScenario(scenario, fallbackName = "Default scenario") {
  const categoryLookup = new Map(
    initialCategories.map((category) => [category.key, category.label])
  );
  const categories = scenario?.categories?.length
    ? scenario.categories.map((category) => ({
        ...category,
        label: categoryLookup.get(category.key) ?? category.label
      }))
    : initialCategories;
  const cardsRaw = scenario?.cards?.length ? scenario.cards : initialCards;
  const migratedCards = mergeCardBenefits(migrateCardRates(cardsRaw));
  const migratedSpend = migrateTravelSpend(scenario?.spend);
  const mergedSpend = mergeSpend(categories, migratedSpend);
  const normalizedSpend =
    scenario?.spendInterval === "monthly"
      ? Object.fromEntries(
          Object.entries(mergedSpend).map(([key, value]) => [key, value * 12])
        )
      : mergedSpend;
  const migratedAssignments = migrateTravelAssignments(scenario?.assignments);

  return {
    id: scenario?.id || `scenario-${Date.now()}`,
    name: scenario?.name || fallbackName,
    favorite: Boolean(scenario?.favorite),
    categories,
    cards: migratedCards,
    spend: normalizedSpend,
    assignments: mergeAssignments(categories, migratedCards, migratedAssignments),
    spendInterval: "annual"
  };
}

function normalizeScenarioForSave(scenario) {
  return {
    ...scenario,
    cards: normalizeCards(scenario.cards, scenario.categories),
    spend: normalizeSpend(scenario.spend),
    assignments: normalizeAssignments(
      scenario.categories,
      scenario.assignments,
      scenario.cards
    )
  };
}

function isBiltCard(card) {
  return card.id.startsWith("bilt-");
}

function getBiltRentRate(nonRentSpend, rentSpend) {
  if (rentSpend <= 0) {
    return 1;
  }
  const ratio = nonRentSpend / rentSpend;
  if (ratio >= 1) {
    return 1.25;
  }
  if (ratio >= 0.75) {
    return 1;
  }
  if (ratio >= 0.5) {
    return 0.75;
  }
  if (ratio >= 0.25) {
    return 0.5;
  }
  return 0;
}

function getBiltRentRatesForScenario(cards, categories, spend, assignments) {
  const totals = cards.reduce((acc, card) => {
    acc[card.id] = { rent: 0, nonRent: 0 };
    return acc;
  }, {});

  categories.forEach((category) => {
    const splits = assignments?.[category.key] || [];
    const amount = Number(spend?.[category.key] || 0);
    splits.forEach((split) => {
      const total = totals[split.cardId];
      if (!total) {
        return;
      }
      const portion = (amount * Number(split.share || 0)) / 100;
      if (category.key === "rent") {
        total.rent += portion;
      } else {
        total.nonRent += portion;
      }
    });
  });

  return cards.reduce((acc, card) => {
    if (!isBiltCard(card)) {
      return acc;
    }
    const totalsForCard = totals[card.id] || { rent: 0, nonRent: 0 };
    acc[card.id] = getBiltRentRate(totalsForCard.nonRent, totalsForCard.rent);
    return acc;
  }, {});
}

function computeScenarioResults(scenario) {
  if (!scenario) {
    return { results: [], spendByCard: {}, biltRentRates: {} };
  }

  const { cards, categories, spend, assignments } = scenario;
  const biltRentRates = getBiltRentRatesForScenario(
    cards,
    categories,
    spend,
    assignments
  );

  const spendByCard = categories.reduce((acc, category) => {
    const amount = Number(spend?.[category.key] || 0);
    const splits = assignments?.[category.key] || [];
    splits.forEach((split) => {
      const portion = (amount * Number(split.share || 0)) / 100;
      acc[split.cardId] = (acc[split.cardId] || 0) + portion;
    });
    return acc;
  }, {});

  const cardTotals = cards.reduce((acc, card) => {
    acc[card.id] = {
      points: 0,
      valueFromSpend: 0,
      benefitValue: card.benefits.reduce(
        (sum, benefit) =>
          sum + (benefit.enabled ? Number(benefit.value || 0) : 0),
        0
      ),
      annualFee: Number(card.annualFee || 0)
    };
    return acc;
  }, {});

  categories.forEach((category) => {
    const annualSpend = Number(spend?.[category.key] || 0);
    const splits = assignments?.[category.key] || [];

    splits.forEach((split) => {
      const card = cards.find((item) => item.id === split.cardId);
      if (!card) {
        return;
      }
      const portion = (annualSpend * Number(split.share || 0)) / 100;
      const rate =
        category.key === "rent" && isBiltCard(card)
          ? biltRentRates[card.id] ?? 1
          : Number(card.rates?.[category.key] || 0);
      const points = portion * rate;
      const valueFromSpend = points * Number(card.cpp || 0);

      cardTotals[card.id].points += points;
      cardTotals[card.id].valueFromSpend += valueFromSpend;
    });
  });

  const results = cards.map((card) => {
    const summary = cardTotals[card.id];
    const grossValue = summary.valueFromSpend + summary.benefitValue;
    const netValue = grossValue - summary.annualFee;

    return {
      id: card.id,
      name: card.name,
      cpp: card.cpp,
      points: summary.points,
      valueFromSpend: summary.valueFromSpend,
      benefitValue: summary.benefitValue,
      annualFee: summary.annualFee,
      grossValue,
      netValue
    };
  });

  return { results, spendByCard, biltRentRates };
}

function createEmptyRates(categories) {
  return categories.reduce((acc, category) => {
    acc[category.key] = 1;
    return acc;
  }, {});
}

function buildDefaultAssignments(categories, cards) {
  if (!cards.length) {
    return {};
  }
  return categories.reduce((acc, category) => {
    acc[category.key] = [{ cardId: cards[0].id, share: 100 }];
    return acc;
  }, {});
}

function mergeSpend(categories, spend) {
  return categories.reduce((acc, category) => {
    acc[category.key] = clampNumber(
      spend?.[category.key] ?? defaultSpend[category.key] ?? 0
    );
    return acc;
  }, {});
}

function mergeAssignments(categories, cards, assignments) {
  const fallback = buildDefaultAssignments(categories, cards);
  return categories.reduce((acc, category) => {
    const entry = assignments?.[category.key];
    if (typeof entry === "string") {
      acc[category.key] = [{ cardId: entry, share: 100 }];
      return acc;
    }
    if (Array.isArray(entry) && entry.length > 0) {
      acc[category.key] = entry.map((split) => ({
        cardId: split.cardId,
        share: Number.isNaN(Number(split.share)) ? 0 : Number(split.share)
      }));
      return acc;
    }
    acc[category.key] = fallback[category.key];
    return acc;
  }, {});
}

function createScenario(name) {
  return normalizeScenario(
    {
      id: `scenario-${Date.now()}`,
      name,
      favorite: false,
      categories: initialCategories,
      cards: initialCards,
      spend: defaultSpend,
      assignments: buildDefaultAssignments(initialCategories, initialCards),
      spendInterval: "annual"
    },
    name
  );
}

function buildAssignmentsForCards(categories, selectedCards) {
  return categories.reduce((acc, category) => {
    let bestCard = selectedCards[0];
    let bestRate = Number(bestCard?.rates?.[category.key] || 0);

    selectedCards.slice(1).forEach((card) => {
      const rate = Number(card?.rates?.[category.key] || 0);
      if (rate > bestRate) {
        bestRate = rate;
        bestCard = card;
      }
    });

    acc[category.key] = [{ cardId: bestCard.id, share: 100 }];
    return acc;
  }, {});
}

function buildDefaultCards() {
  return initialCards.map((card) => ({
    ...card,
    rates: { ...card.rates }
  }));
}

export default function App() {
  const activeUserId = "default";
  const [scenarios, setScenarios] = useState([]);
  const [activeScenarioId, setActiveScenarioId] = useState("");

  const [newCard, setNewCard] = useState({
    name: "",
    annualFee: 0,
    cpp: 0.015
  });
  const [bulkAssignmentCard, setBulkAssignmentCard] = useState("");
  const [autoScenarioCards, setAutoScenarioCards] = useState([]);
  const [showScenarioBuilder, setShowScenarioBuilder] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState("");
  const [advancedMode, setAdvancedMode] = useState(false);
  const [compactMode, setCompactMode] = useState(false);

  const [status, setStatus] = useState("idle");
  const [saveStatus, setSaveStatus] = useState("idle");
  const [error, setError] = useState("");
  const hasLoaded = useRef(false);

  const activeScenario = useMemo(() => {
    if (!scenarios.length) {
      return null;
    }
    return (
      scenarios.find((scenario) => scenario.id === activeScenarioId) ||
      scenarios[0]
    );
  }, [activeScenarioId, scenarios]);

  const categories = activeScenario?.categories || initialCategories;
  const cards = activeScenario?.cards || initialCards;
  const spend = activeScenario?.spend || defaultSpend;
  const assignments =
    activeScenario?.assignments ||
    buildDefaultAssignments(initialCategories, initialCards);

  function updateScenario(updater) {
    if (!activeScenario) {
      return;
    }
    setScenarios((prev) =>
      prev.map((scenario) =>
        scenario.id === activeScenario.id ? updater(scenario) : scenario
      )
    );
  }

  function toggleScenarioFavorite(id) {
    setScenarios((prev) =>
      prev.map((scenario) =>
        scenario.id === id
          ? { ...scenario, favorite: !scenario.favorite }
          : scenario
      )
    );
  }

  function handleCreateScenario() {
    setShowScenarioBuilder(true);
    setNewScenarioName("");
    setAutoScenarioCards([]);
  }

  function handleCloneScenario() {
    if (!activeScenario) {
      return;
    }
    const scenario = normalizeScenario(
      {
        ...activeScenario,
        id: `scenario-${Date.now()}`,
        name: `${activeScenario.name} (copy)`
      },
      activeScenario.name
    );
    setScenarios((prev) => [...prev, scenario]);
    setActiveScenarioId(scenario.id);
  }

  function handleRenameScenario() {
    if (!activeScenario) {
      return;
    }
    const name = window.prompt("Rename scenario", activeScenario.name);
    if (!name) {
      return;
    }
    updateScenario((scenario) => ({
      ...scenario,
      name: name.trim()
    }));
  }

  function toggleAutoScenarioCard(cardId) {
    setAutoScenarioCards((prev) => {
      if (prev.includes(cardId)) {
        return prev.filter((id) => id !== cardId);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, cardId];
    });
  }

  function handleScenarioNameChange(value) {
    const nextName = value;
    setNewScenarioName(nextName);
    const lower = nextName.toLowerCase();
    setAutoScenarioCards((prev) => {
      const matched = cards
        .filter((card) => lower.includes(card.name.toLowerCase()))
        .map((card) => card.id);
      const merged = [...prev, ...matched].filter(
        (id, index, self) => self.indexOf(id) === index
      );
      return merged.slice(0, 3);
    });
  }

  function handleBuildAutoScenario() {
    if (!activeScenario) {
      return;
    }
    if (autoScenarioCards.length === 0) {
      return;
    }

    const selectedCards = autoScenarioCards
      .map((id) => cards.find((card) => card.id === id))
      .filter(Boolean);
    if (selectedCards.length === 0) {
      return;
    }

    const assignments = buildAssignmentsForCards(categories, selectedCards);

    const scenario = normalizeScenario(
      {
        ...activeScenario,
        id: `scenario-${Date.now()}`,
        name: newScenarioName.trim() ||
          `Auto: ${selectedCards.map((card) => card.name).join(" + ")}`,
        assignments
      },
      "Auto scenario"
    );

    setScenarios((prev) => [...prev, scenario]);
    setActiveScenarioId(scenario.id);
    setShowScenarioBuilder(false);
    setNewScenarioName("");
    setAutoScenarioCards([]);
  }

  function handleGenerateAllCombos() {
    if (!activeScenario) {
      return;
    }
    const allCards = cards;
    if (allCards.length === 0) {
      return;
    }

    const combos = [];
    for (let i = 0; i < allCards.length; i += 1) {
      combos.push([allCards[i]]);
      for (let j = i + 1; j < allCards.length; j += 1) {
        combos.push([allCards[i], allCards[j]]);
        for (let k = j + 1; k < allCards.length; k += 1) {
          combos.push([allCards[i], allCards[j], allCards[k]]);
        }
      }
    }

    const confirmGenerate = window.confirm(
      `Generate ${combos.length} scenarios for all 1-3 card combinations?`
    );
    if (!confirmGenerate) {
      return;
    }

    const existingNames = new Set(scenarios.map((scenario) => scenario.name));
    const newScenarios = combos
      .map((combo) => {
        const assignments = buildAssignmentsForCards(categories, combo);
        const name = `Auto: ${combo.map((card) => card.name).join(" + ")}`;
        if (existingNames.has(name)) {
          return null;
        }
        return normalizeScenario(
          {
            ...activeScenario,
            id: `scenario-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            name,
            assignments
          },
          name
        );
      })
      .filter(Boolean);

    if (newScenarios.length === 0) {
      return;
    }
    setScenarios((prev) => [...prev, ...newScenarios]);
  }

  function handleResetCardRates() {
    if (!activeScenario) {
      return;
    }
    const confirmReset = window.confirm(
      "Reset all card earning rates to defaults for this scenario?"
    );
    if (!confirmReset) {
      return;
    }
    const defaultsById = new Map(
      buildDefaultCards().map((card) => [card.id, card.rates])
    );
    updateScenario((scenario) => ({
      ...scenario,
      cards: scenario.cards.map((card) => ({
        ...card,
        rates: defaultsById.get(card.id) || card.rates
      }))
    }));
  }

  function handleDeleteScenario() {
    if (!activeScenario || scenarios.length <= 1) {
      return;
    }
    const confirmDelete = window.confirm(
      `Delete scenario \"${activeScenario.name}\"?`
    );
    if (!confirmDelete) {
      return;
    }
    const next = scenarios.filter(
      (scenario) => scenario.id !== activeScenario.id
    );
    setScenarios(next);
    setActiveScenarioId(next[0]?.id || "");
  }

  function handleDeleteAllScenarios() {
    if (!scenarios.length) {
      return;
    }
    const favorites = scenarios.filter((scenario) => scenario.favorite);
    const confirmDelete = window.confirm(
      favorites.length
        ? "Delete all non-favorite scenarios?"
        : "Delete all scenarios and reset to a single default?"
    );
    if (!confirmDelete) {
      return;
    }
    if (favorites.length > 0) {
      setScenarios(favorites);
      setActiveScenarioId(
        favorites.find((scenario) => scenario.id === activeScenarioId)?.id ||
          favorites[0]?.id ||
          ""
      );
      return;
    }
    const baseScenario = scenarios[0];
    const scenario = normalizeScenario(
      {
        ...createScenario("Default scenario"),
        categories: baseScenario?.categories || initialCategories,
        cards: baseScenario?.cards || initialCards,
        spend: baseScenario?.spend || defaultSpend,
        assignments: baseScenario?.assignments
      },
      "Default scenario"
    );
    setScenarios([scenario]);
    setActiveScenarioId(scenario.id);
  }

  async function handleResetAppData() {
    const confirmReset = window.confirm(
      "Reset app data stored in this browser? This will clear local storage and reload."
    );
    if (!confirmReset) {
      return;
    }
    hasLoaded.current = false;
    setStatus("loading");
    setSaveStatus("idle");
    setScenarios([]);
    setActiveScenarioId("");
    try {
      await resetState();
    } catch (err) {
      console.warn("Unable to reset session data", err);
    }
    try {
      window.localStorage.clear();
    } catch (err) {
      console.warn("Unable to clear localStorage", err);
    }
    window.location.reload();
  }

  useEffect(() => {
    if (!activeUserId) {
      return;
    }
    async function load() {
      hasLoaded.current = false;
      setStatus("loading");
      setSaveStatus("idle");
      setError("");
      setScenarios([]);
      setActiveScenarioId("");
      try {
        const data = await fetchState(activeUserId);
        const loadedScenarios =
          data?.scenarios?.length > 0
            ? data.scenarios.map((scenario, index) =>
                normalizeScenario(
                  scenario,
                  scenario?.name || `Scenario ${index + 1}`
                )
              )
            : [
                normalizeScenario(
                  data,
                  data?.name || "Default scenario"
                )
              ];

        setScenarios(loadedScenarios);
        setActiveScenarioId(
          data?.activeScenarioId || loadedScenarios[0]?.id || ""
        );
        setStatus("ready");
      } catch (err) {
        setError(err.message);
        setStatus("error");
      } finally {
        hasLoaded.current = true;
      }
    }

    load();
  }, [activeUserId]);

  useEffect(() => {
    if (!hasLoaded.current || status !== "ready" || scenarios.length === 0) {
      return;
    }

    setSaveStatus("saving");
    const handle = setTimeout(() => {
      saveState(
        {
          scenarios: scenarios.map(normalizeScenarioForSave),
          activeScenarioId
        },
        activeUserId
      )
        .then(() => setSaveStatus("saved"))
        .catch((err) => {
          setError(err.message);
          setSaveStatus("error");
        });
    }, 800);

    return () => clearTimeout(handle);
  }, [activeScenarioId, scenarios, status]);

  const scenarioCalc = useMemo(
    () => computeScenarioResults(activeScenario),
    [activeScenario]
  );
  const results = scenarioCalc.results;
  const spendByCard = scenarioCalc.spendByCard;
  const biltRentRates = scenarioCalc.biltRentRates;

  const pnlRows = [
    { key: "valueFromSpend", label: "Spend value", sign: "plus" },
    { key: "benefitValue", label: "Benefits", sign: "plus" },
    { key: "annualFee", label: "Annual fees", sign: "minus" },
    { key: "netValue", label: "Net value", sign: "net" }
  ];

  const activeResults = results.filter(
    (result) => (spendByCard[result.id] || 0) > 0
  );
  const sortedResults = [...activeResults].sort(
    (a, b) => b.netValue - a.netValue
  );
  const totalsByRow = pnlRows.reduce((acc, row) => {
    acc[row.key] = sortedResults.reduce(
      (sum, card) => sum + Number(card[row.key] || 0),
      0
    );
    return acc;
  }, {});
  const totalPoints = sortedResults.reduce(
    (sum, card) => sum + Number(card.points || 0),
    0
  );

  const spendSummary = useMemo(() => {
    const byCardCategory = cards.reduce((acc, card) => {
      acc[card.id] = categories.reduce((catAcc, category) => {
        catAcc[category.key] = 0;
        return catAcc;
      }, {});
      return acc;
    }, {});
    const totals = cards.reduce((acc, card) => {
      acc[card.id] = 0;
      return acc;
    }, {});

    categories.forEach((category) => {
      const amount = Number(spend[category.key] || 0);
      const splits = assignments[category.key] || [];
      splits.forEach((split) => {
        const portion = (amount * Number(split.share || 0)) / 100;
        if (!byCardCategory[split.cardId]) {
          return;
        }
        byCardCategory[split.cardId][category.key] += portion;
        totals[split.cardId] += portion;
      });
    });

    const max = Object.values(totals).reduce(
      (maxValue, value) => Math.max(maxValue, value),
      0
    );

    return { byCardCategory, totals, max };
  }, [assignments, cards, categories, spend]);

  const categoryColors = useMemo(
    () => ({
      dining: "#70201d",
      groceries: "#962d27",
      flights: "#d06965",
      travelOther: "#de9997",
      rent: "#edcccb",
      gas: "#3f3f3f",
      streaming: "#6f6f6f",
      misc: "#a6a6a6"
    }),
    []
  );

  function handleSpendChange(categoryKey, value) {
    updateScenario((scenario) => ({
      ...scenario,
      spend: {
        ...scenario.spend,
        [categoryKey]: parseSpendInput(value)
      }
    }));
  }

  function handleSplitChange(categoryKey, index, field, value) {
    updateScenario((scenario) => {
      const next = scenario.assignments?.[categoryKey]
        ? [...scenario.assignments[categoryKey]]
        : [];
      const updated = {
        ...next[index],
        [field]: field === "share" ? parseNumberInput(value) : value
      };
      next[index] = updated;
      return {
        ...scenario,
        assignments: {
          ...scenario.assignments,
          [categoryKey]: next
        }
      };
    });
  }

  function handleAddSplit(categoryKey) {
    updateScenario((scenario) => ({
      ...scenario,
      assignments: {
        ...scenario.assignments,
        [categoryKey]: [
          ...(scenario.assignments?.[categoryKey] || []),
          { cardId: cards[0]?.id || "", share: 0 }
        ]
      }
    }));
  }

  function handleRemoveSplit(categoryKey, index) {
    updateScenario((scenario) => {
      const next = (scenario.assignments?.[categoryKey] || []).filter(
        (_, i) => i !== index
      );
      if (next.length === 0) {
        next.push({ cardId: cards[0]?.id || "", share: 100 });
      }
      return {
        ...scenario,
        assignments: {
          ...scenario.assignments,
          [categoryKey]: next
        }
      };
    });
  }

  function handleAssignAll() {
    const cardId = bulkAssignmentCard || cards[0]?.id;
    if (!cardId) {
      return;
    }
    updateScenario((scenario) => ({
      ...scenario,
      assignments: scenario.categories.reduce((acc, category) => {
        acc[category.key] = [{ cardId, share: 100 }];
        return acc;
      }, {})
    }));
  }

  function handleToggleBenefit(cardId, benefitId) {
    updateScenario((scenario) => ({
      ...scenario,
      cards: scenario.cards.map((card) => {
        if (card.id !== cardId) {
          return card;
        }
        return {
          ...card,
          benefits: card.benefits.map((benefit) =>
            benefit.id === benefitId
              ? { ...benefit, enabled: !benefit.enabled }
              : benefit
          )
        };
      })
    }));
  }

  function handleRateChange(cardId, categoryKey, value) {
    updateScenario((scenario) => ({
      ...scenario,
      cards: scenario.cards.map((card) => {
        if (card.id !== cardId) {
          return card;
        }
        return {
          ...card,
          rates: {
            ...card.rates,
            [categoryKey]: parseNumberInput(value)
          }
        };
      })
    }));
  }

  function handleAnnualFeeChange(cardId, value) {
    updateScenario((scenario) => ({
      ...scenario,
      cards: scenario.cards.map((card) => {
        if (card.id !== cardId) {
          return card;
        }
        return {
          ...card,
          annualFee: parseNumberInput(value)
        };
      })
    }));
  }

  function handleAddBenefit(cardId) {
    const label = window.prompt("Benefit name");
    if (!label) {
      return;
    }
    const valueInput = window.prompt("Annual value (USD)");
    const value = clampSignedNumber(valueInput);

    updateScenario((scenario) => ({
      ...scenario,
      cards: scenario.cards.map((card) => {
        if (card.id !== cardId) {
          return card;
        }
        return {
          ...card,
          benefits: [
            ...card.benefits,
            {
              id: `${card.id}-${Date.now()}`,
              label,
              value,
              enabled: true
            }
          ]
        };
      })
    }));
  }

  function handleAddCard(event) {
    event.preventDefault();
    if (!newCard.name.trim()) {
      return;
    }

    const id = newCard.name.trim().toLowerCase().replace(/\s+/g, "-");
    const card = {
      id: `${id}-${Date.now()}`,
      name: newCard.name.trim(),
      annualFee: clampNumber(newCard.annualFee),
      cpp: clampNumber(newCard.cpp) || 0.01,
      rates: createEmptyRates(categories),
      benefits: []
    };

    updateScenario((scenario) => ({
      ...scenario,
      cards: [...scenario.cards, card],
      assignments: scenario.assignments?.misc?.length
        ? scenario.assignments
        : {
            ...scenario.assignments,
            misc: [{ cardId: card.id, share: 100 }]
          }
    }));
    setNewCard({ name: "", annualFee: 0, cpp: 0.015 });
  }

  const annualSpendTotal = Object.values(spend).reduce(
      (sum, value) => sum + Number(value || 0),
      0
    );

  const scenarioSummaries = useMemo(
    () =>
      scenarios
        .map((scenario) => {
          const calc = computeScenarioResults(scenario);
          const activeCards = calc.results.filter(
            (result) => (calc.spendByCard[result.id] || 0) > 0
          );
          const totalNet = activeCards.reduce(
            (sum, result) => sum + result.netValue,
            0
          );
          return {
            id: scenario.id,
            name: scenario.name,
            favorite: Boolean(scenario.favorite),
            totalNet,
            netByCard: activeCards.map((result) => ({
              id: result.id,
              name: result.name,
              netValue: result.netValue
            }))
          };
        })
        .sort((a, b) => b.totalNet - a.totalNet),
    [scenarios]
  );

  const maxScenarioNetAbs = useMemo(() => {
    return scenarioSummaries.reduce(
      (max, summary) => Math.max(max, Math.abs(summary.totalNet || 0)),
      0
    );
  }, [scenarioSummaries]);

  const scenarioCards = useMemo(() => {
    const map = new Map();
    scenarioSummaries.forEach((summary) => {
      summary.netByCard.forEach((entry) => {
        if (!map.has(entry.id)) {
          map.set(entry.id, entry.name);
        }
      });
    });
    return Array.from(map.entries()).map(([id, name], index) => ({
      id,
      name,
      index
    }));
  }, [scenarioSummaries]);

  function getCardColor(index) {
    const palette = [
      "#70201d",
      "#962d27",
      "#d06965",
      "#de9997",
      "#3f3f3f",
      "#6f6f6f",
      "#a6a6a6",
      "#c7c7c7"
    ];
    return palette[index % palette.length];
  }

  return (
    <div className={compactMode ? "page page--compact" : "page"}>
      <header className="hero">
        <div>
          <p className="eyebrow">Card Value Studio</p>
          <h1>Compare credit card value based on how you spend.</h1>
          <p className="subtitle">
            Toggle benefits you actually use, assign each spending category to a
            card, and see which lineup earns the most value after fees.
          </p>
          {status === "loading" && (
            <p className="status">Loading saved workspace...</p>
          )}
          {status === "error" && (
            <p className="status status--error">{error}</p>
          )}
        </div>
        <div className="hero-panel">
          <h3>Current P&L by card</h3>
          <div className="pnl-scroll">
            <div
              className="pnl-table pnl-table--cards"
              style={{ "--pnl-cols": 6 }}
            >
              <div className="pnl-header">
                <span className="pnl-label">Card</span>
                <span className="pnl-net">Net value</span>
                <span>Spend value</span>
                <span>Benefits</span>
                <span>Annual fees</span>
                <span>Total points</span>
              </div>
              {sortedResults.map((card) => (
                <div className="pnl-row" key={card.id}>
                  <span className="pnl-label">{card.name}</span>
                  <span className="pnl-net">{formatCurrency(card.netValue)}</span>
                  <span className="pnl-plus">{formatCurrency(card.valueFromSpend)}</span>
                  <span className="pnl-plus">{formatCurrency(card.benefitValue)}</span>
                  <span className="pnl-minus">{formatCurrency(card.annualFee)}</span>
                  <span>{Math.round(card.points).toLocaleString()}</span>
                </div>
              ))}
              <div className="pnl-row pnl-total-row">
                <span className="pnl-label">Total</span>
                <span className="pnl-net">{formatCurrency(totalsByRow.netValue)}</span>
                <span className="pnl-plus">
                  {formatCurrency(totalsByRow.valueFromSpend)}
                </span>
                <span className="pnl-plus">
                  {formatCurrency(totalsByRow.benefitValue)}
                </span>
                <span className="pnl-minus">
                  {formatCurrency(totalsByRow.annualFee)}
                </span>
                <span>{Math.round(totalPoints).toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="hero-grid">
            <div>
              <span>Annual spend</span>
              <strong>{formatCurrency(annualSpendTotal)}</strong>
            </div>
            <div>
              <span>Total net value</span>
              <strong>
                {formatCurrency(totalsByRow.netValue)}
              </strong>
            </div>
          </div>
          <div className="mode-toggle">
            <label>
              <input
                type="checkbox"
                checked={compactMode}
                onChange={(event) => setCompactMode(event.target.checked)}
              />
              <span>Compact layout</span>
            </label>
          </div>
          <p className="save-status">
            {saveStatus === "saving" && "Saving changes..."}
            {saveStatus === "saved" && "Saved"}
            {saveStatus === "error" && "Save failed"}
          </p>
          <div className="hero-actions">
            <button type="button" className="ghost" onClick={handleResetAppData}>
              Reset app data
            </button>
          </div>
        </div>
      </header>

      <main className="layout">
        <section className="panel">
          <div className="scenario-header">
            <div>
              <h2>Scenarios</h2>
              <p className="panel-meta">
                Create, clone, or delete full workspace scenarios.
              </p>
            </div>
            <div className="scenario-actions">
              <button type="button" className="ghost" onClick={handleCreateScenario}>
                New scenario
              </button>
              <button type="button" className="ghost" onClick={handleCloneScenario}>
                Clone
              </button>
              <button type="button" className="ghost" onClick={handleRenameScenario}>
                Rename
              </button>
              <button type="button" className="ghost" onClick={handleDeleteAllScenarios}>
                Delete all
              </button>
              <button
                type="button"
                className="ghost"
                onClick={handleDeleteScenario}
                disabled={scenarios.length <= 1}
              >
                Delete
              </button>
            </div>
          </div>
          <div className="scenario-row">
            <label>
              <span>Active scenario</span>
              <select
                value={activeScenario?.id || ""}
                onChange={(event) => setActiveScenarioId(event.target.value)}
              >
                {scenarios.map((scenario) => (
                  <option key={scenario.id} value={scenario.id}>
                    {scenario.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {showScenarioBuilder && (
            <div className="scenario-builder">
              <div>
                <h3>New scenario builder</h3>
                <p className="panel-meta">
                  Name the scenario and pick 1-3 cards. Each category will be
                  routed to the highest points rate among your selections.
                </p>
              </div>
              <label className="scenario-name">
                <span>Scenario name</span>
                <input
                  type="text"
                  value={newScenarioName}
                  onChange={(event) => handleScenarioNameChange(event.target.value)}
                  placeholder="e.g., Amex + Venture X"
                />
              </label>
              <div className="scenario-card-picker">
                {cards.map((card) => {
                  const selected = autoScenarioCards.includes(card.id);
                  return (
                    <button
                      type="button"
                      key={card.id}
                      className={
                        selected ? "picker-card picker-card--active" : "picker-card"
                      }
                      onClick={() => toggleAutoScenarioCard(card.id)}
                    >
                      <span>{card.name}</span>
                      <span className="picker-meta">{card.cpp.toFixed(3)} CPP</span>
                    </button>
                  );
                })}
              </div>
              <div className="scenario-builder-actions">
                <span className="picker-meta">
                  Selected {autoScenarioCards.length} / 3
                </span>
                <div className="scenario-actions">
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => setShowScenarioBuilder(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="ghost"
                    onClick={handleBuildAutoScenario}
                    disabled={!autoScenarioCards.length || !newScenarioName.trim()}
                  >
                    Create scenario
                  </button>
                  <button
                    type="button"
                    className="ghost"
                    onClick={handleGenerateAllCombos}
                  >
                    Build all combos
                  </button>
                </div>
              </div>
            </div>
          )}
          {!showScenarioBuilder && (
            <div className="scenario-builder">
            <div>
              <h3>Auto-route by best rate</h3>
              <p className="panel-meta">
                Pick 1-3 cards. Each category will be assigned to the highest
                points rate among your selections.
              </p>
            </div>
            <div className="scenario-card-picker">
              {cards.map((card) => {
                const selected = autoScenarioCards.includes(card.id);
                return (
                  <button
                    type="button"
                    key={card.id}
                    className={selected ? "picker-card picker-card--active" : "picker-card"}
                    onClick={() => toggleAutoScenarioCard(card.id)}
                  >
                    <span>{card.name}</span>
                    <span className="picker-meta">{card.cpp.toFixed(3)} CPP</span>
                  </button>
                );
              })}
            </div>
            <div className="scenario-builder-actions">
              <span className="picker-meta">
                Selected {autoScenarioCards.length} / 3
              </span>
              <div className="scenario-actions">
                <button
                  type="button"
                  className="ghost"
                  onClick={handleBuildAutoScenario}
                >
                  Build scenario
                </button>
                <button
                  type="button"
                  className="ghost"
                  onClick={handleGenerateAllCombos}
                >
                  Build all combos
                </button>
              </div>
            </div>
            </div>
          )}
        </section>
        <section className="panel">
          <h2>Scenario comparison</h2>
          <p className="panel-meta">
            Compare total net value by card across scenarios.
          </p>
          <div className="scenario-chart">
            <div className="scenario-legend">
              {scenarioCards.map((card) => (
                <div className="legend-item" key={card.id}>
                  <span
                    className="legend-swatch"
                    style={{ backgroundColor: getCardColor(card.index) }}
                  />
                  <span>{card.name}</span>
                </div>
              ))}
            </div>
            <div className="scenario-bars">
              {scenarioSummaries.map((summary) => {
                const barWidth = maxScenarioNetAbs
                  ? `${(Math.abs(summary.totalNet) / maxScenarioNetAbs) * 100}%`
                  : "0%";
                return (
                  <div
                    className={
                      summary.id === activeScenarioId
                        ? "scenario-row scenario-row--active"
                        : "scenario-row"
                    }
                    key={summary.id}
                    onClick={() => setActiveScenarioId(summary.id)}
                  >
                    <div className="scenario-row-label">
                      <span>{summary.name}</span>
                      <button
                        type="button"
                        className={
                          summary.favorite
                            ? "scenario-favorite scenario-favorite--active"
                            : "scenario-favorite"
                        }
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleScenarioFavorite(summary.id);
                        }}
                      >
                        {summary.favorite ? "Pinned" : "Pin"}
                      </button>
                    </div>
                    <div className="scenario-row-bar">
                      {summary.totalNet === 0 && (
                        <span className="scenario-muted">No spend routed</span>
                      )}
                      <div className="scenario-bar-track">
                        <div className="scenario-bar" style={{ width: barWidth }}>
                          {summary.totalNet > 0 &&
                            summary.netByCard.map((entry) => {
                              const cardIndex = scenarioCards.findIndex(
                                (card) => card.id === entry.id
                              );
                              const width =
                                (entry.netValue / summary.totalNet) * 100;
                              return (
                                <span
                                  key={`${summary.id}-${entry.id}`}
                                  className="scenario-segment"
                                  style={{
                                    width: `${width}%`,
                                    backgroundColor: getCardColor(cardIndex)
                                  }}
                                  title={`${entry.name}: ${formatCurrency(
                                    entry.netValue
                                  )}`}
                                >
                                  <span className="segment-label">
                                    {formatCurrency(entry.netValue)}
                                  </span>
                                </span>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                    <div className="scenario-row-value">
                      {formatCurrency(summary.totalNet)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        <section className="panel">
          <div className="panel-header">
            <h2>Card summaries</h2>
            <p className="panel-meta">Net value = spend value + benefits - fee</p>
          </div>
          <div className="category-legend">
            {categories.map((category) => (
              <div className="legend-item" key={category.key}>
                <span
                  className="legend-swatch"
                  style={{ backgroundColor: categoryColors[category.key] || "#ccc" }}
                />
                <span>{category.label}</span>
              </div>
            ))}
          </div>
          <div className="card-grid">
            {sortedResults.map((result, index) => (
              <article
                className={index === 0 ? "card-summary card-best" : "card-summary"}
                key={result.id}
              >
                <div className="card-summary-header">
                  <h3>{result.name}</h3>
                  <span>{formatCurrency(result.netValue)}</span>
                </div>
                <div className="card-spend-bar">
                  <div className="card-spend-bar__meta">
                    <span>Spend routed</span>
                    <strong>{formatCurrency(spendSummary.totals[result.id])}</strong>
                  </div>
                  <div className="card-spend-bar__scale">
                    <div
                      className="card-spend-bar__stack"
                      style={{
                        width: spendSummary.max
                          ? `${(spendSummary.totals[result.id] / spendSummary.max) * 100}%`
                          : "0%"
                      }}
                      title={`Spend: ${formatCurrency(spendSummary.totals[result.id])}`}
                    >
                      {(() => {
                        const total = spendSummary.totals[result.id] || 0;
                        if (total <= 0) {
                          return null;
                        }
                        const sortedCategories = categories
                          .map((category) => ({
                            key: category.key,
                            label: category.label,
                            amount:
                              spendSummary.byCardCategory[result.id]?.[category.key] || 0
                          }))
                          .filter((entry) => entry.amount > 0)
                          .sort((a, b) => b.amount - a.amount);

                        return sortedCategories.map((entry) => (
                          <span
                            key={`${result.id}-${entry.key}`}
                            className="card-spend-bar__segment"
                            style={{
                              width: `${(entry.amount / total) * 100}%`,
                              backgroundColor: categoryColors[entry.key] || "#ccc"
                            }}
                            title={`${entry.label}: ${formatCurrency(entry.amount)}`}
                          />
                        ));
                      })()}
                    </div>
                  </div>
                </div>
                <div className="card-summary-body">
                  <div>
                    <span>Spend value</span>
                    <strong>{formatCurrency(result.valueFromSpend)}</strong>
                  </div>
                  <div>
                    <span>Benefits</span>
                    <strong>{formatCurrency(result.benefitValue)}</strong>
                  </div>
                  <div>
                    <span>Annual fee</span>
                    <strong>{formatCurrency(result.annualFee)}</strong>
                  </div>
                  <div>
                    <span>Total points</span>
                    <strong>{result.points.toFixed(0)}</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>Spending and assignments</h2>
          <p className="panel-meta">
            Enter your annual spend per category and select the card you want to
            use.
          </p>
          <div className="advanced-toggle">
            <label>
              <input
                type="checkbox"
                checked={advancedMode}
                onChange={(event) => setAdvancedMode(event.target.checked)}
              />
              <span>Advanced mode (multi-card splits)</span>
            </label>
          </div>
          <div className="bulk-assign">
            <label>
              <span>Assign all categories to</span>
              <select
                value={bulkAssignmentCard || ""}
                onChange={(event) => setBulkAssignmentCard(event.target.value)}
              >
                <option value="">Select a card</option>
                {cards.map((card) => (
                  <option value={card.id} key={card.id}>
                    {card.name}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className="ghost" onClick={handleAssignAll}>
              Apply to all
            </button>
          </div>
          <table className="assignment-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Annual spend</th>
                <th>Assignments</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.key}>
                  <td>{category.label}</td>
                  <td>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatNumberInput(spend[category.key])}
                      onChange={(event) =>
                        handleSpendChange(
                          category.key,
                          parseNumberString(event.target.value)
                        )
                      }
                    />
                  </td>
                  <td>
                    {advancedMode ? (
                      <div className="split-list">
                        {(assignments[category.key] || []).map((split, index) => (
                          <div className="split-row" key={`${category.key}-${index}`}>
                            <select
                              value={split.cardId}
                              onChange={(event) =>
                                handleSplitChange(
                                  category.key,
                                  index,
                                  "cardId",
                                  event.target.value
                                )
                              }
                            >
                              {cards.map((card) => (
                                <option value={card.id} key={card.id}>
                                  {card.name}
                                </option>
                              ))}
                            </select>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={split.share}
                              onChange={(event) =>
                                handleSplitChange(
                                  category.key,
                                  index,
                                  "share",
                                  event.target.value
                                )
                              }
                            />
                            <span className="split-suffix">%</span>
                            <button
                              type="button"
                              className="ghost"
                              onClick={() => handleRemoveSplit(category.key, index)}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <div className="split-actions">
                          <button
                            type="button"
                            className="ghost"
                            onClick={() => handleAddSplit(category.key)}
                          >
                            Add split
                          </button>
                          <span className="split-total">
                            Total:{" "}
                            {(assignments[category.key] || []).reduce(
                              (sum, split) => sum + Number(split.share || 0),
                              0
                            )}
                            %
                          </span>
                        </div>
                      </div>
                    ) : (
                      <select
                        value={assignments[category.key]?.[0]?.cardId || ""}
                        onChange={(event) =>
                          handleSplitChange(
                            category.key,
                            0,
                            "cardId",
                            event.target.value
                          )
                        }
                      >
                        {cards.map((card) => (
                          <option value={card.id} key={card.id}>
                            {card.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="table-total">
                <td>Total</td>
                <td>{formatCurrency(annualSpendTotal)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </section>

        <section className="panel">
          <h2>Benefits and earning rates</h2>
          <p className="panel-meta">
            Toggle benefits on and off, and adjust earning multipliers.
          </p>
          <div className="rates-actions">
            <button type="button" className="ghost" onClick={handleResetCardRates}>
              Reset Default Card Rates
            </button>
          </div>
          <div className="benefits-table-wrap">
            <table className="benefits-table">
              <thead>
                <tr>
                  <th>Card</th>
                  <th>Annual fee</th>
                  <th>Benefits</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cards.map((card) => (
                  <tr key={card.id}>
                    <td>
                      <div className="card-name">
                        <strong>{card.name}</strong>
                        {isBiltCard(card) && (
                          <>
                            <span className="card-note">
                              Rent multiplier: {(biltRentRates[card.id] ?? 1).toFixed(2)}x
                            </span>
                            <span className="card-note">
                              Rent points: no Bilt Cash option (points only, not toggleable)
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatNumberInput(card.annualFee)}
                        onChange={(event) =>
                          handleAnnualFeeChange(
                            card.id,
                            parseNumberString(event.target.value)
                          )
                        }
                      />
                    </td>
                    <td>
                      <div className="benefit-list">
                        {card.benefits.length === 0 && (
                          <span className="empty">No benefits yet.</span>
                        )}
                        {card.benefits.map((benefit) => (
                          <label className="benefit-row" key={benefit.id}>
                            <input
                              type="checkbox"
                              checked={benefit.enabled}
                              onChange={() =>
                                handleToggleBenefit(card.id, benefit.id)
                              }
                            />
                            <span>{benefit.label}</span>
                            <strong>{formatCurrency(benefit.value)}</strong>
                          </label>
                        ))}
                      </div>
                    </td>
                    <td>
                      <button
                        className="ghost"
                        type="button"
                        onClick={() => handleAddBenefit(card.id)}
                      >
                        Add benefit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rates-table-wrap">
            <table className="rates-table">
              <thead>
                <tr>
                  <th>Category</th>
                  {cards.map((card) => (
                    <th key={card.id}>{card.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.key}>
                    <td>{category.label}</td>
                    {cards.map((card) => (
                      <td key={`${card.id}-${category.key}`}>
                        <div className="rate-input">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={card.rates[category.key]}
                            onChange={(event) =>
                              handleRateChange(
                                card.id,
                                category.key,
                                event.target.value
                              )
                            }
                          />
                          <span className="rate-suffix">x</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <h2>Add a card</h2>
          <form className="add-card" onSubmit={handleAddCard}>
            <label>
              <span>Card name</span>
              <input
                type="text"
                value={newCard.name}
                onChange={(event) =>
                  setNewCard((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Card name"
              />
            </label>
            <label>
              <span>Annual fee</span>
              <input
                type="text"
                inputMode="numeric"
                value={formatNumberInput(newCard.annualFee)}
                onChange={(event) =>
                  setNewCard((prev) => ({
                    ...prev,
                    annualFee: parseNumberInput(
                      parseNumberString(event.target.value)
                    )
                  }))
                }
              />
            </label>
            <label>
              <span>Value per point (USD)</span>
              <input
                type="number"
                min="0"
                step="0.001"
                value={newCard.cpp}
                onChange={(event) =>
                  setNewCard((prev) => ({
                    ...prev,
                    cpp: parseNumberInput(event.target.value)
                  }))
                }
              />
            </label>
            <button type="submit">Add card</button>
          </form>
        </section>
      </main>
    </div>
  );
}
