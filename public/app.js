const state = {
  dashboard: null,
  currentView: "command",
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const money = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) throw new Error((await response.json()).error || "Request failed");
  return response.json();
}

function toast(message) {
  const element = $("#toast");
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(toast.timeout);
  toast.timeout = setTimeout(() => element.classList.remove("show"), 2400);
}

function setView(view) {
  state.currentView = view;
  $$("[data-view-panel]").forEach((panel) => panel.classList.toggle("active", panel.dataset.viewPanel === view));
  $$(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === view));
  $("#sidebar").classList.remove("open");
  try { window.history.replaceState({}, "", `#${view}`); } catch { /* Embedded preview may have an opaque origin. */ }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function actionIcon(category) {
  return { purchase: "↓", growth: "◎", labor: "↔" }[category] || "↗";
}

function renderAction(action) {
  const disabled = action.status !== "pending";
  return `
    <article class="action-card ${action.status}" data-action-id="${action.id}">
      <div class="action-symbol">${actionIcon(action.category)}</div>
      <div class="action-main">
        <strong>${action.title}</strong>
        <p>${action.reason}</p>
        <div class="action-meta">
          <span><b>${action.confidence}%</b> confidence</span>
          <span>${action.risk} risk</span>
          <span>${action.due}</span>
          ${disabled ? `<span class="status-chip">${action.status}</span>` : ""}
        </div>
      </div>
      <div class="action-value">
        <strong>+${money(action.impact)}</strong>
        <small>estimated impact</small>
        <div class="action-buttons">
          <button data-status="dismissed" ${disabled ? "disabled" : ""}>Dismiss</button>
          <button class="approve" data-status="approved" ${disabled ? "disabled" : ""}>Approve</button>
        </div>
      </div>
    </article>`;
}

function renderActions() {
  const actions = state.dashboard.actions;
  $("#command-actions").innerHTML = actions.slice(0, 3).map(renderAction).join("");
  $("#all-actions").innerHTML = actions.map(renderAction).join("");
  const pending = actions.filter((action) => action.status === "pending").length;
  $("#action-count").textContent = pending;
  $("#pending-summary").textContent = `${pending} action${pending === 1 ? "" : "s"}`;
}

function renderSparkline() {
  const values = [26, 31, 29, 42, 38, 51, 56];
  const max = Math.max(...values);
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 100},${28 - (value / max) * 25}`).join(" ");
  $("#recoverable-sparkline").innerHTML = `<svg viewBox="0 0 100 30" preserveAspectRatio="none"><polyline fill="none" stroke="#84e5ad" stroke-width="1.7" points="${points}"/><polyline fill="rgba(132,229,173,.08)" stroke="none" points="0,30 ${points} 100,30"/></svg>`;
}

function renderMiniBars() {
  const values = state.dashboard.dailyForecast.map((item) => item.revenue);
  const max = Math.max(...values);
  $("#forecast-mini-bars").innerHTML = values.map((value) => `<span style="height:${Math.round((value / max) * 100)}%"></span>`).join("");
}

function renderRevenueChart() {
  const data = state.dashboard.dailyForecast;
  const width = 500;
  const height = 210;
  const padding = { left: 26, right: 18, top: 14, bottom: 28 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const maxRevenue = Math.max(...data.map((item) => item.revenue)) * 1.12;
  const x = (index) => padding.left + (index / (data.length - 1)) * plotWidth;
  const y = (value) => padding.top + plotHeight - (value / maxRevenue) * plotHeight;
  const revenuePoints = data.map((item, index) => `${x(index)},${y(item.revenue)}`).join(" ");
  const marginPoints = data.map((item, index) => `${x(index)},${padding.top + plotHeight - ((item.margin - 25) / 15) * plotHeight}`).join(" ");
  const labels = data.map((item, index) => `<text x="${x(index)}" y="${height - 7}" text-anchor="middle" fill="#6f847d" font-size="9">${item.day}</text>`).join("");
  const grid = [0.25, 0.5, 0.75, 1].map((ratio) => `<line x1="${padding.left}" x2="${width - padding.right}" y1="${padding.top + plotHeight * ratio}" y2="${padding.top + plotHeight * ratio}" stroke="rgba(180,220,203,.09)" stroke-dasharray="3 5" />`).join("");
  const dots = data.map((item, index) => `<circle cx="${x(index)}" cy="${y(item.revenue)}" r="3" fill="#84e5ad" stroke="#10231d" stroke-width="2"/>`).join("");

  $("#revenue-chart").innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img">
      ${grid}
      <polygon points="${padding.left},${padding.top + plotHeight} ${revenuePoints} ${width - padding.right},${padding.top + plotHeight}" fill="rgba(132,229,173,.055)" />
      <polyline points="${revenuePoints}" fill="none" stroke="#84e5ad" stroke-width="2.5" />
      <polyline points="${marginPoints}" fill="none" stroke="#8ebeff" stroke-width="1.7" stroke-dasharray="5 5" />
      ${dots}${labels}
    </svg>`;
}

function renderLedger() {
  $("#ledger-body").innerHTML = state.dashboard.ledger.map((item) => `
    <tr><td>${item.date}</td><td>${item.action}</td><td>${money(item.predicted)}</td><td>${money(item.realized)}</td><td><span class="status-chip">✓ ${item.result}</span></td></tr>
  `).join("");
}

function renderGraph() {
  const positions = {
    menu: [50, 50], ingredients: [18, 23], suppliers: [17, 77], labor: [82, 21], equipment: [83, 76], channels: [50, 14],
  };
  const nodes = state.dashboard.graph.nodes;
  const lines = nodes.filter((node) => node.id !== "menu").map((node) => {
    const [x1, y1] = positions.menu;
    const [x2, y2] = positions[node.id];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    return `<span class="graph-line" style="left:${x1}%;top:${y1}%;width:${length}%;transform:rotate(${angle}deg)"></span>`;
  }).join("");
  const nodeMarkup = nodes.map((node) => `<div class="graph-node ${node.type}" style="left:${positions[node.id][0]}%;top:${positions[node.id][1]}%"><strong>${node.label}</strong><small>${node.count} mapped</small></div>`).join("");
  $("#graph-canvas").innerHTML = lines + nodeMarkup;

  const summary = state.dashboard.graph.summary;
  const coverage = Object.entries(summary.coverage).map(([name, value]) => `
    <div class="coverage-row"><div><span>${name.replace(/([A-Z])/g, " $1")}</span><strong>${value}%</strong></div><div class="progress"><span style="width:${value}%"></span></div></div>
  `).join("");
  $("#twin-summary").innerHTML = `
    <span class="eyebrow">Model confidence</span><h3>${summary.confidence}% understood</h3>
    <div class="twin-stat"><span>Entities</span><strong>${summary.entities}</strong></div>
    <div class="twin-stat"><span>Relationships</span><strong>${summary.relationships}</strong></div>
    <div class="coverage-list">${coverage}</div>
    <div class="verify-list"><strong>Human verification needed</strong><ul>${summary.nextVerification.map((item) => `<li>${item}</li>`).join("")}</ul></div>`;
}

function renderLaunch() {
  const launch = state.dashboard.launch;
  $("#viability-score").textContent = `${launch.viabilityScore}/100`;
  $("#break-even-guests").textContent = launch.breakEvenGuests;
  $("#runway-months").textContent = `${launch.runwayMonths} mo`;
  $("#launch-checklist").innerHTML = launch.checklist.map((item) => `
    <div class="check-item"><span class="check-state ${item.state}">${item.state === "complete" ? "✓" : item.state === "active" ? "•" : ""}</span><strong>${item.label}</strong><small>${item.state}</small></div>
  `).join("");
}

function renderIntegrations() {
  $("#integration-grid").innerHTML = state.dashboard.integrations.map((integration) => `
    <article class="integration-card">
      <div class="integration-top"><span class="integration-logo">${integration.name.slice(0, 1)}</span><span class="integration-status ${integration.status}">${integration.status}</span></div>
      <h3>${integration.name}</h3><p>${integration.category} · ${integration.detail}</p>
    </article>`).join("");
}

function renderDashboard() {
  const dashboard = state.dashboard;
  $("#restaurant-name").textContent = dashboard.restaurant.name;
  $("#restaurant-location").textContent = `${dashboard.restaurant.city}, ${dashboard.restaurant.region}`;
  $("#health-score").textContent = dashboard.healthScore;
  $("#recoverable-value").textContent = money(dashboard.recoverableValue);
  $("#headline-value").textContent = money(dashboard.recoverableValue);
  $("#weekly-revenue").textContent = money(dashboard.weeklyRevenue);
  $("#projected-margin").textContent = `${dashboard.projectedMargin}%`;
  renderActions();
  renderSparkline();
  renderMiniBars();
  renderRevenueChart();
  renderLedger();
  renderGraph();
  renderLaunch();
  renderIntegrations();
}

async function updateAction(id, status) {
  try {
    const result = await api(`/api/actions/${encodeURIComponent(id)}`, { method: "POST", body: JSON.stringify({ status }) });
    state.dashboard = result.dashboard;
    renderDashboard();
    toast(status === "approved" ? "Action approved and added to the execution queue." : "Action dismissed. ParPilot will learn from the decision.");
  } catch (error) {
    toast(error.message);
  }
}

function bindEvents() {
  $$(".nav-item").forEach((item) => item.addEventListener("click", () => setView(item.dataset.view)));
  $$('[data-jump]').forEach((button) => button.addEventListener("click", () => setView(button.dataset.jump)));
  $("#menu-button").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
  document.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-status]");
    if (actionButton) {
      const card = actionButton.closest("[data-action-id]");
      updateAction(card.dataset.actionId, actionButton.dataset.status);
    }
  });

  const dialog = $("#ask-dialog");
  $("#ask-button").addEventListener("click", () => dialog.showModal());
  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      dialog.showModal();
    }
  });
  $$(".suggested-questions button").forEach((button) => button.addEventListener("click", () => {
    $(".ask-input input").value = button.textContent;
    $(".ask-input input").focus();
  }));

  $("#campaign-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = event.submitter;
    const original = button.textContent;
    button.disabled = true;
    button.textContent = "Modeling demand and capacity…";
    try {
      const body = Object.fromEntries(new FormData(event.currentTarget));
      const campaign = await api("/api/localpulse/generate", { method: "POST", body: JSON.stringify(body) });
      renderCampaign(campaign);
    } catch (error) {
      toast(error.message);
    } finally {
      button.disabled = false;
      button.textContent = original;
    }
  });
}

function renderCampaign(campaign) {
  $("#campaign-output").innerHTML = `
    <article class="campaign-card">
      <div class="campaign-creative"><div class="creative-copy"><span>${campaign.schedule}</span><h3>${campaign.offer}</h3><p>Built for profitable local demand—not vanity engagement.</p></div></div>
      <div class="campaign-details">
        <span class="eyebrow">Recommended campaign</span><h3>${campaign.title}</h3><p>${campaign.rationale}</p>
        <div class="forecast-strip">
          <div><small>Extra orders</small><strong>${campaign.forecast.incrementalOrders}</strong></div>
          <div><small>Revenue</small><strong>${campaign.forecast.incrementalRevenue}</strong></div>
          <div><small>Profit</small><strong>${campaign.forecast.incrementalProfit}</strong></div>
          <div><small>Confidence</small><strong>${campaign.forecast.confidence}%</strong></div>
        </div>
        <div class="caption-box">${campaign.caption}</div>
        <div class="guardrail-list">${campaign.guardrails.map((item) => `<span>${item}</span>`).join("")}</div>
        <div class="campaign-actions"><button class="secondary-button" id="regenerate-campaign">Regenerate</button><button class="primary-button" id="approve-campaign">Approve for ${campaign.channels.length} channels</button></div>
      </div>
    </article>`;
  $("#approve-campaign").addEventListener("click", () => toast("Campaign approved. Publishing remains in simulated mode."));
  $("#regenerate-campaign").addEventListener("click", () => $("#campaign-form").requestSubmit());
}

async function init() {
  bindEvents();
  try {
    state.dashboard = await api("/api/dashboard");
    renderDashboard();
    const initial = location.hash.replace("#", "");
    if ($(`[data-view-panel="${initial}"]`)) setView(initial);
  } catch (error) {
    document.body.innerHTML = `<main style="padding:40px;color:white;font-family:sans-serif"><h1>ParPilot could not start.</h1><p>${error.message}</p></main>`;
  }
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
}

init();
