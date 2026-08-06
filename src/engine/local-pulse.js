const regionalSignals = {
  WI: ["cheese curds", "Friday fish fry", "bratwurst", "game-day bundles"],
  MN: ["wild rice", "hotdish", "walleye", "family comfort meals"],
  TX: ["smoked meats", "breakfast tacos", "spicy bundles", "large-format catering"],
  CA: ["fresh produce", "plant-forward options", "seasonal bowls", "lighter lunch bundles"],
};

const objectives = {
  margin: "Protect margin without teaching regulars to wait for discounts.",
  traffic: "Fill a specific low-demand service window without overloading the kitchen.",
  waste: "Move time-sensitive inventory while preserving contribution profit.",
  awareness: "Feature a distinctive local item without automatically discounting it.",
};

export function generateLocalCampaign({ city, region, objective = "margin", event = "", inventoryItem = "cheese curds" }) {
  const signals = regionalSignals[region] ?? ["local favorites", "family bundles", "seasonal ingredients"];
  const featuredSignal = signals.includes(inventoryItem) ? inventoryItem : signals[0];
  const eventPhrase = event ? ` around ${event}` : " during the underused Sunday afternoon window";
  const requiresDiscount = objective === "traffic" || objective === "waste";
  const offer = requiresDiscount
    ? `${featuredSignal} family bundle with two entrées`
    : `featured ${featuredSignal} pairing with no automatic discount`;

  return {
    title: `${city} LocalPulse: ${offer}`,
    objective,
    strategy: objectives[objective] ?? objectives.margin,
    rationale: `The recommendation combines ${region} regional relevance, this restaurant’s capacity window, contribution margin, current inventory and expected demand${eventPhrase}.`,
    offer,
    channels: ["Facebook", "Instagram", "Google Business Profile"],
    schedule: "Thursday at 5:15 PM",
    forecast: {
      incrementalOrders: requiresDiscount ? "31–44" : "14–22",
      incrementalRevenue: requiresDiscount ? "$510–$720" : "$260–$410",
      incrementalProfit: requiresDiscount ? "$176–$244" : "$142–$218",
      stockoutRisk: "Low",
      confidence: 84,
    },
    caption: `Wisconsin flavor, right here in ${city}. 🧀 This week we’re featuring our ${featuredSignal}${requiresDiscount ? " in a family bundle built for sharing" : "—crispy, local and made for the table"}. Available while today’s kitchen capacity lasts.`,
    guardrails: [
      "Pause automatically if projected stock falls below safety level.",
      "Do not publish if kitchen capacity exceeds 88%.",
      "Measure incremental profit, not likes or gross sales alone.",
    ],
  };
}
