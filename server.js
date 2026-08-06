import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { restaurant, dailyForecast, ledger, integrations, graphNodes, launchChecklist } from "./src/data/demo.js";
import { calculateHealthScore, calculateRecoverableValue, simulatePromotion } from "./src/engine/profit-engine.js";
import { generateLocalCampaign } from "./src/engine/local-pulse.js";
import { buildRestaurantGraph } from "./src/engine/digital-twin.js";
import { listActions, updateActionStatus } from "./src/platform/store.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const publicDirectory = join(__dirname, "public");
const indexParts = ["index.1.html", "index.2.html", "index.3.html"];
const port = Number(process.env.PORT || 3000);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json",
};

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

async function parseJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (!chunks.length) return {};
  const raw = Buffer.concat(chunks).toString("utf8");
  if (raw.length > 1_000_000) throw new Error("Request body too large");
  return JSON.parse(raw);
}

function dashboardPayload() {
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
    actions,
    dailyForecast,
    ledger,
    integrations,
    graph: {
      nodes: graphNodes,
      summary: buildRestaurantGraph({}),
    },
    launch: {
      viabilityScore: 81,
      breakEvenGuests: 167,
      runwayMonths: 5.8,
      checklist: launchChecklist,
    },
  };
}

async function handleApi(request, response, url) {
  if (request.method === "GET" && url.pathname === "/api/health") {
    return sendJson(response, 200, { status: "ok", service: "ParPilot AI", time: new Date().toISOString() });
  }

  if (request.method === "GET" && url.pathname === "/api/dashboard") {
    return sendJson(response, 200, dashboardPayload());
  }

  if (request.method === "GET" && url.pathname === "/api/restaurant-graph") {
    return sendJson(response, 200, buildRestaurantGraph({}));
  }

  if (request.method === "POST" && /^\/api\/actions\/[^/]+$/.test(url.pathname)) {
    const id = decodeURIComponent(url.pathname.split("/").pop());
    const body = await parseJson(request);
    const action = updateActionStatus(id, body.status);
    if (!action) return sendJson(response, 404, { error: "Action not found" });
    return sendJson(response, 200, { action, dashboard: dashboardPayload() });
  }

  if (request.method === "POST" && url.pathname === "/api/localpulse/generate") {
    const body = await parseJson(request);
    return sendJson(
      response,
      200,
      generateLocalCampaign({
        city: body.city || restaurant.city,
        region: body.region || restaurant.region,
        objective: body.objective || "margin",
        event: body.event || "",
        inventoryItem: body.inventoryItem || "cheese curds",
      }),
    );
  }

  if (request.method === "POST" && url.pathname === "/api/simulate/promotion") {
    const body = await parseJson(request);
    return sendJson(response, 200, simulatePromotion({
      baselineOrders: Number(body.baselineOrders || 180),
      averageTicket: Number(body.averageTicket || 18.5),
      foodCostRate: Number(body.foodCostRate || 0.29),
      discountRate: Number(body.discountRate || 0.15),
      expectedLift: Number(body.expectedLift || 0.2),
      capacityLimit: Number(body.capacityLimit || 230),
    }));
  }

  return sendJson(response, 404, { error: "API route not found" });
}

async function readIndex() {
  const parts = await Promise.all(indexParts.map((part) => readFile(join(publicDirectory, part))));
  return Buffer.concat(parts);
}

async function serveStatic(response, pathname) {
  if (pathname === "/" || pathname === "/index.html") {
    const index = await readIndex();
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
    response.end(index);
    return;
  }
  const requested = pathname;
  const safePath = normalize(requested).replace(/^(\.\.[/\\])+/, "");
  let filePath = join(publicDirectory, safePath);

  if (!filePath.startsWith(publicDirectory)) {
    return sendJson(response, 403, { error: "Forbidden" });
  }

  try {
    const fileStats = await stat(filePath);
    if (fileStats.isDirectory()) filePath = join(filePath, "index.html");
    const contents = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream",
      "Cache-Control": filePath.endsWith("index.html") ? "no-cache" : "public, max-age=3600",
    });
    response.end(contents);
  } catch {
    const index = await readIndex();
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
    response.end(index);
  }
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
    if (url.pathname.startsWith("/api/")) return await handleApi(request, response, url);
    return await serveStatic(response, url.pathname);
  } catch (error) {
    console.error(error);
    return sendJson(response, 500, { error: error.message || "Unexpected server error" });
  }
});

server.listen(port, () => {
  console.log(`ParPilot AI running at http://localhost:${port}`);
});
