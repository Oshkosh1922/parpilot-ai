import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { restaurant, dailyForecast, ledger, integrations, graphNodes, launchChecklist } from "../data/demo.js";
import { calculateHealthScore, calculateRecoverableValue, simulatePromotion } from "../engine/profit-engine.js";
import { generateLocalCampaign } from "../engine/local-pulse.js";
import { buildRestaurantGraph } from "../engine/digital-twin.js";
import { buildLaunchBlueprint } from "../engine/launch-engine.js";
import { buildGuestExperience } from "../engine/guest-engine.js";
import { estimateAnnualValue } from "../engine/roi-engine.js";
import { recommendFacilityPaths, buildOperatingActivationPlan } from "../engine/onboarding-engine.js";
import { listActions, updateActionStatus } from "./store.js";

const root = fileURLToPath(new URL("../../", import.meta.url));
const publicDir = join(root, "public");
const pages = {
  "/": "index.html",
  "/app": ["index.1.html", "index.2.html", "index.3.html"],
  "/start": "start.html",
  "/guest": "guest.html",
};
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json",
};

function json(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(JSON.stringify(payload));
}

async function body(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  const raw = Buffer.concat(chunks).toString("utf8");
  if (raw.length > 1_000_000) throw new Error("Request body too large");
  return JSON.parse(raw);
}

function dashboard() {
  const actions = listActions();
  return {
    restaurant,
    generatedAt: new Date().toISOString(),
    healthScore: calculateHealthScore({ foodCost: 29.8, laborCost: 30.4, wasteRate: 2.7, ticketMinutes: 14, cashRunwayDays: 37 }),
    recoverableValue: calculateRecoverableValue(actions),
    weeklyRevenue: dailyForecast.reduce((sum, day) => sum + day.revenue, 0),
    projectedMargin: 33.4,
    actions,
    dailyForecast,
    ledger,
    integrations,
    graph: { nodes: graphNodes, summary: buildRestaurantGraph({}) },
    launch: { viabilityScore: 81, breakEvenGuests: 167, runwayMonths: 5.8, checklist: launchChecklist },
    guest: buildGuestExperience({}),
  };
}

async function api(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/health") return json(res, 200, { status: "ok", service: "ParPilot", mode: "presentation", time: new Date().toISOString() });
  if (req.method === "GET" && url.pathname === "/api/dashboard") return json(res, 200, dashboard());
  if (req.method === "GET" && url.pathname === "/api/restaurant-graph") return json(res, 200, buildRestaurantGraph({}));
  if (req.method === "POST" && /^\/api\/actions\/[^/]+$/.test(url.pathname)) {
    const id = decodeURIComponent(url.pathname.split("/").pop());
    const data = await body(req);
    const action = updateActionStatus(id, data.status);
    if (!action) return json(res, 404, { error: "Action not found" });
    return json(res, 200, { action, dashboard: dashboard() });
  }
  if (req.method === "POST" && url.pathname === "/api/localpulse/generate") {
    const data = await body(req);
    return json(res, 200, generateLocalCampaign({ city: data.city || restaurant.city, region: data.region || restaurant.region, objective: data.objective || "margin", event: data.event || "", inventoryItem: data.inventoryItem || "cheese curds" }));
  }
  if (req.method === "POST" && url.pathname === "/api/simulate/promotion") {
    const data = await body(req);
    return json(res, 200, simulatePromotion({ baselineOrders: Number(data.baselineOrders || 180), averageTicket: Number(data.averageTicket || 18.5), foodCostRate: Number(data.foodCostRate || 0.29), discountRate: Number(data.discountRate || 0.15), expectedLift: Number(data.expectedLift || 0.2), capacityLimit: Number(data.capacityLimit || 230) }));
  }
  if (req.method === "POST" && url.pathname === "/api/roi") return json(res, 200, estimateAnnualValue(await body(req)));
  if (req.method === "POST" && url.pathname === "/api/launch/blueprint") return json(res, 200, buildLaunchBlueprint(await body(req)));
  if (req.method === "POST" && url.pathname === "/api/onboarding/facilities") return json(res, 200, recommendFacilityPaths(await body(req)));
  if (req.method === "POST" && url.pathname === "/api/onboarding/activation") return json(res, 200, buildOperatingActivationPlan(await body(req)));
  if (req.method === "POST" && url.pathname === "/api/guest/context") return json(res, 200, buildGuestExperience(await body(req)));
  if (req.method === "POST" && url.pathname === "/api/onboarding") {
    const data = await body(req);
    return json(res, 201, { id: `demo_${Date.now()}`, mode: "presentation", journey: data.journey || "aspiring", next: data.journey === "operating" ? "/app" : "/app#launch" });
  }
  return json(res, 404, { error: "API route not found" });
}

async function readPage(page) {
  if (typeof page === "string") return readFile(join(publicDir, page));
  const parts = await Promise.all(page.map((name) => readFile(join(publicDir, name))));
  return Buffer.concat(parts);
}

async function servePage(res, page) {
  const data = await readPage(page);
  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-cache",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  });
  res.end(data);
}

async function staticFile(res, path) {
  const named = pages[path];
  if (named) return servePage(res, named);
  const safe = normalize(path.replace(/^\//, "")).replace(/^(\.\.[/\\])+/, "").replace(/^[/\\]+/, "");
  let file = join(publicDir, safe);
  if (!file.startsWith(publicDir)) return json(res, 403, { error: "Forbidden" });
  try {
    const info = await stat(file);
    if (info.isDirectory()) file = join(file, "index.html");
    const data = await readFile(file);
    res.writeHead(200, {
      "Content-Type": types[extname(file)] || "application/octet-stream",
      "Cache-Control": extname(file) === ".html" ? "no-cache" : "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    });
    res.end(data);
  } catch {
    res.writeHead(302, { Location: "/" });
    res.end();
  }
}

export async function handleRequest(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    if (url.pathname.startsWith("/api/")) return await api(req, res, url);
    const path = url.pathname.replace(/\/$/, "") || "/";
    return await staticFile(res, path);
  } catch (error) {
    console.error(error);
    return json(res, 500, { error: error.message || "Unexpected server error" });
  }
}
