import { Agent, run, tool, webSearchTool } from "@openai/agents";
import { z } from "zod";
import { restaurant, dailyForecast, ledger, integrations, graphNodes } from "../data/demo.js";
import { calculateHealthScore, calculateRecoverableValue, simulatePromotion } from "../engine/profit-engine.js";
import { generateLocalCampaign } from "../engine/local-pulse.js";
import { buildRestaurantGraph } from "../engine/digital-twin.js";
import { estimateAnnualValue } from "../engine/roi-engine.js";
import { listActions } from "../platform/store.js";

const configuredModel = process.env.OPENAI_MODEL?.trim();
const modelConfig = configuredModel ? { model: configuredModel } : {};

const getRestaurantSnapshot = tool({
  name: "get_restaurant_snapshot",
  description: "Read the current ParPilot operating snapshot: restaurant, forecast, ledger, integrations, health score, recoverable value, and pending actions.",
  parameters: z.object({}),
  async execute() {
    const actions = listActions();
    return {
      restaurant,
      generatedAt: new Date().toISOString(),
      healthScore: calculateHealthScore({
        foodCost: 29.8,
        laborCost: 30.4,
        wasteRate: 2.7,
        ticketMinutes: 14,
        cashRunwayDays: 37,
      }),
      recoverableValue: calculateRecoverableValue(actions),
      weeklyRevenue: dailyForecast.reduce((sum, day) => sum + day.revenue, 0),
      projectedMargin: 33.4,
      dailyForecast,
      ledger,
      integrations,
      actions,
    };
  },
});

const getOperatingGraph = tool({
  name: "get_operating_graph",
  description: "Inspect the restaurant digital twin and the major operational entities/relationships ParPilot currently knows about.",
  parameters: z.object({}),
  async execute() {
    return { nodes: graphNodes, summary: buildRestaurantGraph({}) };
  },
});

const simulatePromotionTool = tool({
  name: "simulate_promotion",
  description: "Model the revenue, margin, demand, and capacity effect of a proposed restaurant promotion before recommending it.",
  parameters: z.object({
    baselineOrders: z.number().positive(),
    averageTicket: z.number().positive(),
    foodCostRate: z.number().min(0).max(1),
    discountRate: z.number().min(0).max(1),
    expectedLift: z.number().min(-1).max(5),
    capacityLimit: z.number().positive(),
  }),
  async execute(input) {
    return simulatePromotion(input);
  },
});

const localCampaignTool = tool({
  name: "generate_local_campaign",
  description: "Generate a locally relevant restaurant campaign from location, objective, local event context, and inventory pressure.",
  parameters: z.object({
    city: z.string().min(1),
    region: z.string().min(1),
    objective: z.string().min(1),
    event: z.string().default(""),
    inventoryItem: z.string().min(1),
  }),
  async execute(input) {
    return generateLocalCampaign(input);
  },
});

const roiTool = tool({
  name: "estimate_annual_value",
  description: "Estimate annual financial value from operational improvements. Use this when quantifying the business case for a recommendation.",
  parameters: z.object({
    monthlyRevenue: z.number().optional(),
    foodCostRate: z.number().optional(),
    laborCostRate: z.number().optional(),
    wasteRate: z.number().optional(),
    annualSoftwareCost: z.number().optional(),
  }),
  async execute(input) {
    return estimateAnnualValue(input);
  },
});

const operationsAgent = new Agent({
  name: "ParPilot Operations Agent",
  ...modelConfig,
  instructions: `You are ParPilot's restaurant operations specialist. Diagnose operational bottlenecks using the restaurant snapshot and digital twin. Focus on labor, throughput, inventory, waste, service reliability, and execution. Separate observations from assumptions. Recommend concrete actions, but do not claim any external system was changed.`,
  tools: [getRestaurantSnapshot, getOperatingGraph],
});

const profitAgent = new Agent({
  name: "ParPilot Profit Agent",
  ...modelConfig,
  instructions: `You are ParPilot's restaurant profitability specialist. Find margin leakage and quantify opportunities. Use the operating snapshot before making claims. Simulate promotions when relevant and estimate financial impact when enough inputs exist. Prefer profit dollars and contribution margin over vanity revenue. Never invent financial data.`,
  tools: [getRestaurantSnapshot, simulatePromotionTool, roiTool],
});

const growthAgent = new Agent({
  name: "ParPilot Local Growth Agent",
  ...modelConfig,
  instructions: `You are ParPilot's local demand and marketing specialist. Combine restaurant context with current local information when it materially improves a decision. Research weather, events, seasonality, and local demand signals, then translate them into specific restaurant campaigns. Treat web information as external evidence, not restaurant truth.`,
  tools: [getRestaurantSnapshot, localCampaignTool, webSearchTool({ searchContextSize: "low" })],
});

const operationsTool = operationsAgent.asTool({
  toolName: "consult_operations_agent",
  toolDescription: "Delegate an operations, labor, inventory, throughput, waste, or service-quality problem to ParPilot's operations specialist.",
});

const profitTool = profitAgent.asTool({
  toolName: "consult_profit_agent",
  toolDescription: "Delegate a margin, pricing, promotion, food-cost, ROI, or profitability question to ParPilot's profit specialist.",
});

const growthTool = growthAgent.asTool({
  toolName: "consult_local_growth_agent",
  toolDescription: "Delegate local demand research, event/weather opportunity detection, or localized promotion planning to ParPilot's growth specialist.",
});

const operator = new Agent({
  name: "ParPilot Restaurant Operator",
  ...modelConfig,
  instructions: `You are the coordinating intelligence for ParPilot, an AI restaurant operating system. Your job is to turn an owner's objective into a short operational decision loop: observe, diagnose, quantify, recommend, and identify the safest next action.

Use specialist agents when their domain matters. Use the restaurant snapshot yourself when you need grounding before delegation. You may combine specialists for cross-functional problems.

Rules:
- Never pretend demo or connected data is fresher than it is.
- Never claim an external POS, payroll, supplier, ad account, social network, or scheduling system was changed unless a future execution tool explicitly reports success.
- Distinguish facts, estimates, and assumptions.
- Prefer a few high-value actions over a long generic checklist.
- For irreversible, financial, staffing, purchasing, pricing, publishing, or customer-facing actions, recommend an approval step rather than autonomous execution.
- End with: Situation, Best actions, Expected impact, Confidence, Approval needed.
`,
  tools: [getRestaurantSnapshot, operationsTool, profitTool, growthTool],
});

export function isAgentConfigured() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export async function runRestaurantOperator({ objective, maxTurns = 10 } = {}) {
  if (!isAgentConfigured()) {
    const error = new Error("ParPilot Agent Core is installed but OPENAI_API_KEY is not configured.");
    error.code = "AGENT_NOT_CONFIGURED";
    throw error;
  }

  const cleanObjective = String(objective || "Review the restaurant and identify the highest-value action to take next.").trim();
  const result = await run(operator, cleanObjective, { maxTurns });

  return {
    objective: cleanObjective,
    output: String(result.finalOutput || ""),
    generatedAt: new Date().toISOString(),
    mode: "agent",
  };
}
