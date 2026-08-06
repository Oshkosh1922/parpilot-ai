import test from "node:test";
import assert from "node:assert/strict";
import { calculateActionValue, calculateHealthScore, simulatePromotion } from "../src/engine/profit-engine.js";
import { generateLocalCampaign } from "../src/engine/local-pulse.js";

 test("health score remains bounded", () => {
  const score = calculateHealthScore({ foodCost: 29, laborCost: 30, wasteRate: 2, ticketMinutes: 12, cashRunwayDays: 40 });
  assert.ok(score >= 0 && score <= 100);
});

test("action value discounts medium-risk recommendations", () => {
  assert.equal(calculateActionValue({ impact: 100, confidence: 80, risk: "Medium" }), 68);
});

test("promotion simulator does not exceed capacity", () => {
  const result = simulatePromotion({
    baselineOrders: 200,
    averageTicket: 20,
    foodCostRate: 0.3,
    discountRate: 0.1,
    expectedLift: 0.5,
    capacityLimit: 230,
  });
  assert.equal(result.fulfilledExtraOrders, 30);
  assert.equal(result.capacityRisk, "High");
});

test("LocalPulse produces a capacity-aware campaign", () => {
  const campaign = generateLocalCampaign({ city: "Menasha", region: "WI", objective: "waste" });
  assert.match(campaign.caption, /Menasha/);
  assert.ok(campaign.guardrails.length >= 3);
});
