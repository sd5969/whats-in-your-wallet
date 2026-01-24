import { useEffect, useMemo, useRef, useState } from "react";
import { fetchState, saveState } from "./api.js";

const initialCategories = [
  { key: "dining", label: "Dining" },
  { key: "groceries", label: "Groceries" },
  { key: "flights", label: "Flights" },
  { key: "travelOther", label: "Other travel" },
  { key: "rent", label: "Rent" },
  { key: "gas", label: "Gas" },
  { key: "streaming", label: "Streaming" },
  { key: "misc", label: "Everything Else" }
];

const initialCards = [
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

const defaultSpend = {
  dining: 4200,
  groceries: 5200,
  flights: 1900,
  travelOther: 1900,
  rent: 18000,
  gas: 1400,
  streaming: 600,
  misc: 7200
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
      acc[key] = clampNumber(card.rates?.[key] ?? 0);
      return acc;
    }, {}),
    benefits: card.benefits.map((benefit) => ({
      ...benefit,
      value: clampNumber(benefit.value)
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
    if (card.rates?.travel === undefined) {
      return card;
    }
    return {
      ...card,
      rates: {
        ...card.rates,
        flights: card.rates.flights ?? card.rates.travel,
        travelOther: card.rates.travelOther ?? card.rates.travel
      }
    };
  });
}

function normalizeScenario(scenario, fallbackName = "Default scenario") {
  const categories = scenario?.categories?.length
    ? scenario.categories
    : initialCategories;
  const cardsRaw = scenario?.cards?.length ? scenario.cards : initialCards;
  const migratedCards = migrateCardRates(cardsRaw);
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
      categories: initialCategories,
      cards: initialCards,
      spend: defaultSpend,
      assignments: buildDefaultAssignments(initialCategories, initialCards),
      spendInterval: "annual"
    },
    name
  );
}

export default function App() {
  const [scenarios, setScenarios] = useState([]);
  const [activeScenarioId, setActiveScenarioId] = useState("");

  const [newCard, setNewCard] = useState({
    name: "",
    annualFee: 0,
    cpp: 0.015
  });
  const [bulkAssignmentCard, setBulkAssignmentCard] = useState("");

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

  function handleCreateScenario() {
    const name = window.prompt("Scenario name");
    if (!name) {
      return;
    }
    const scenario = createScenario(name.trim());
    setScenarios((prev) => [...prev, scenario]);
    setActiveScenarioId(scenario.id);
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

  useEffect(() => {
    async function load() {
      setStatus("loading");
      setError("");
      try {
        const data = await fetchState();
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
  }, []);

  useEffect(() => {
    if (!hasLoaded.current) {
      return;
    }

    setSaveStatus("saving");
    const handle = setTimeout(() => {
      saveState({
        scenarios: scenarios.map(normalizeScenarioForSave),
        activeScenarioId
      })
        .then(() => setSaveStatus("saved"))
        .catch((err) => {
          setError(err.message);
          setSaveStatus("error");
        });
    }, 800);

    return () => clearTimeout(handle);
  }, [activeScenarioId, scenarios]);

  const biltRentRates = useMemo(() => {
    const totals = cards.reduce((acc, card) => {
      acc[card.id] = { rent: 0, nonRent: 0 };
      return acc;
    }, {});

    categories.forEach((category) => {
      const splits = assignments[category.key] || [];
      const amount = Number(spend[category.key] || 0);
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
      acc[card.id] = getBiltRentRate(
        totalsForCard.nonRent,
        totalsForCard.rent
      );
      return acc;
    }, {});
  }, [assignments, cards, categories, spend]);

  const results = useMemo(() => {
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
      const annualSpend = Number(spend[category.key] || 0);
      const splits = assignments[category.key] || [];

      splits.forEach((split) => {
        const card = cards.find((item) => item.id === split.cardId);
        if (!card) {
          return;
        }
        const portion = (annualSpend * Number(split.share || 0)) / 100;
        const rate =
          category.key === "rent" && isBiltCard(card)
            ? biltRentRates[card.id] ?? 1
            : Number(card.rates[category.key] || 0);
        const points = portion * rate;
        const valueFromSpend = points * Number(card.cpp || 0);

        cardTotals[card.id].points += points;
        cardTotals[card.id].valueFromSpend += valueFromSpend;
      });
    });

    return cards.map((card) => {
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
  }, [assignments, biltRentRates, cards, categories, spend]);

  const spendByCard = useMemo(() => {
    return categories.reduce((acc, category) => {
      const annualSpend = Number(spend[category.key] || 0);
      const splits = assignments[category.key] || [];
      splits.forEach((split) => {
        const portion = (annualSpend * Number(split.share || 0)) / 100;
        acc[split.cardId] = (acc[split.cardId] || 0) + portion;
      });
      return acc;
    }, {});
  }, [assignments, categories, spend]);

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
    const value = clampNumber(valueInput);

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

  return (
    <div className="page">
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
              className="pnl-table"
              style={{ "--pnl-cols": sortedResults.length + 1 }}
            >
              <div className="pnl-header">
                <span className="pnl-label">Metric</span>
                {sortedResults.map((card) => (
                  <span key={card.id}>{card.name}</span>
                ))}
                <span className="pnl-total">Total</span>
              </div>
              {pnlRows.map((row) => (
                <div className="pnl-row" key={row.key}>
                  <span className="pnl-label">{row.label}</span>
                  {sortedResults.map((card) => (
                    <span
                      key={`${card.id}-${row.key}`}
                      className={
                        row.sign === "plus"
                          ? "pnl-plus"
                          : row.sign === "minus"
                          ? "pnl-minus"
                          : "pnl-net"
                      }
                    >
                      {row.sign === "plus" && "+"}{" "}
                      {row.sign === "minus" && "-"}{" "}
                      {formatCurrency(card[row.key])}
                    </span>
                  ))}
                  <span
                    className={
                      row.sign === "plus"
                        ? "pnl-plus pnl-total"
                        : row.sign === "minus"
                        ? "pnl-minus pnl-total"
                        : "pnl-net pnl-total"
                    }
                  >
                    {row.sign === "plus" && "+"} {row.sign === "minus" && "-"}{" "}
                  {formatCurrency(totalsByRow[row.key])}
                </span>
              </div>
            ))}
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
          <p className="save-status">
            {saveStatus === "saving" && "Saving changes..."}
            {saveStatus === "saved" && "Saved"}
            {saveStatus === "error" && "Save failed"}
          </p>
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
        </section>
        <section className="panel">
          <h2>Spending and assignments</h2>
          <p className="panel-meta">
            Enter your annual spend per category and select the card you want to
            use.
          </p>
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
          <div className="table">
            <div className="table-row table-head">
              <span>Category</span>
              <span>Annual spend</span>
              <span>Assignments</span>
            </div>
            {categories.map((category) => (
              <div className="table-row" key={category.key}>
                <span>{category.label}</span>
                <input
                  type="number"
                  min="0"
                  value={spend[category.key]}
                  onChange={(event) =>
                    handleSpendChange(category.key, event.target.value)
                  }
                />
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
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Card summaries</h2>
            <p className="panel-meta">Net value = spend value + benefits - fee</p>
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
          <h2>Benefits and earning rates</h2>
          <p className="panel-meta">
            Toggle benefits on and off, and adjust earning multipliers.
          </p>
          <div className="cards-list">
            {cards.map((card) => (
              <div className="card-detail" key={card.id}>
                <div className="card-detail-header">
                  <div>
                    <h3>{card.name}</h3>
                    <div className="card-fee">
                      <label>
                        <span>Annual fee</span>
                        <input
                          type="number"
                          min="0"
                          value={card.annualFee}
                          onChange={(event) =>
                            handleAnnualFeeChange(card.id, event.target.value)
                          }
                        />
                      </label>
                    </div>
                    {isBiltCard(card) && (
                      <p className="card-note">
                        Rent multiplier auto-adjusted:{" "}
                        {(biltRentRates[card.id] ?? 1).toFixed(2)}x
                      </p>
                    )}
                  </div>
                  <button
                    className="ghost"
                    type="button"
                    onClick={() => handleAddBenefit(card.id)}
                  >
                    Add benefit
                  </button>
                </div>
                <div className="benefits">
                  {card.benefits.length === 0 && (
                    <p className="empty">No benefits yet.</p>
                  )}
                  {card.benefits.map((benefit) => (
                    <label className="benefit" key={benefit.id}>
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
                <div className="rates">
                  {categories.map((category) => (
                    <label className="rate" key={`${card.id}-${category.key}`}>
                      <span>{category.label}</span>
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
                    </label>
                  ))}
                </div>
              </div>
            ))}
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
                type="number"
                min="0"
                value={newCard.annualFee}
                onChange={(event) =>
                  setNewCard((prev) => ({
                    ...prev,
                    annualFee: parseNumberInput(event.target.value)
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
