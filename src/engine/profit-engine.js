const bounded = (value, min, max) => Math.max(min, Math.min(max, value));

export function calculateHealthScore({ foodCost, laborCost, wasteRate, ticketMinutes, cashRunwayDays }) {
  const foodScore = bounded(100 - Math.abs(foodCost - 29) * 5, 0, 100);
  const laborScore = bounded(100 - Math.abs(laborCost - 30) * 4, 0, 100);
  const wasteScore = bounded(100 - wasteRate * 10, 0, 100);
  const serviceScore = bounded(100 - Math.max(0, ticketMinutes - 12) * 5, 0, 100);
  const cashScore = bounded(cashRunwayDays * 2, 0, 100);

  return Math.round(
    foodScore * 0.24 +
      laborScore * 0.24 +
      wasteScore * 0.18 +
      serviceScore * 0.16 +
      cashScore * 0.18,
  );
}

export function calculateActionValue(action) {
  const confidenceFactor = action.confidence / 100;
  const riskPenalty = action.risk === "High" ? 0.65 : action.risk === "Medium" ? 0.85 : 1;
  return Math.round(action.impact * confidenceFactor * riskPenalty);
}

export function calculateRecoverableValue(actions) {
  return actions
    .filter((action) => action.status === "pending")
    .reduce((sum, action) => sum + calculateActionValue(action), 0);
}

export function simulatePromotion({ baselineOrders, averageTicket, foodCostRate, discountRate, expectedLift, capacityLimit }) {
  const extraOrders = Math.round(baselineOrders * expectedLift);
  const fulfilledExtraOrders = Math.min(extraOrders, Math.max(0, capacityLimit - baselineOrders));
  const promotionRevenue = fulfilledExtraOrders * averageTicket * (1 - discountRate);
  const variableCost = promotionRevenue * foodCostRate;
  const cannibalizationCost = baselineOrders * 0.18 * averageTicket * discountRate;
  const incrementalProfit = promotionRevenue - variableCost - cannibalizationCost;

  return {
    extraOrders,
    fulfilledExtraOrders,
    incrementalRevenue: Math.round(promotionRevenue),
    incrementalProfit: Math.round(incrementalProfit),
    capacityRisk: extraOrders > fulfilledExtraOrders ? "High" : fulfilledExtraOrders > capacityLimit * 0.15 ? "Medium" : "Low",
  };
}
