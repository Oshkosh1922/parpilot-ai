# ParPilot AI

**ParPilot is a low-friction restaurant profitability operating system designed to work above the software and hardware a restaurant already owns.**

It is not intended to be another dashboard. The product identifies the small number of actions most likely to improve profit, explains the evidence and risk, waits for approval where appropriate, and records whether the action actually worked.

![ParPilot status](https://img.shields.io/badge/status-MVP%20foundation-84e5ad)
![Node](https://img.shields.io/badge/Node-20%2B-84e5ad)
![Dependencies](https://img.shields.io/badge/runtime%20dependencies-0-84e5ad)

## What is included

- **Restaurant Command Center** with health, forecast, capacity and owner-interruption metrics
- **Profit Action Ledger** that compares predicted savings with realized outcomes
- **LocalPulse** for capacity-aware, city-specific campaign generation
- **Restaurant Graph** digital-twin visualization and confidence tracking
- **Launch Mode** for concept validation, break-even planning and opening milestones
- **Integration Fabric** designed around existing POS, accounting, labor, supplier and marketing tools
- **Human approval controls** for financial, purchasing and public-facing actions
- **Progressive web app support** for installation on existing phones and tablets
- **Zero-dependency Node API** so the prototype runs without package installation
- **Automated engine tests** using Node's built-in test runner

## Run it

Requirements: Node.js 20 or newer.

```bash
npm start
```

Open `http://localhost:3000`.

For watch mode:

```bash
npm run dev
```

Run validation:

```bash
npm test
npm run check
```

## API routes

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/health` | Service health |
| `GET` | `/api/dashboard` | Complete restaurant command-center payload |
| `GET` | `/api/restaurant-graph` | Digital-twin coverage and confidence |
| `POST` | `/api/actions/:id` | Approve or dismiss a recommendation |
| `POST` | `/api/localpulse/generate` | Generate a capacity-aware local campaign |
| `POST` | `/api/simulate/promotion` | Estimate promotion revenue, profit and capacity risk |

Example:

```bash
curl -X POST http://localhost:3000/api/localpulse/generate \
  -H 'content-type: application/json' \
  -d '{"city":"Menasha","region":"WI","objective":"margin","inventoryItem":"cheese curds"}'
```

## Product principles

1. **No mandatory hardware replacement.** Software connections and existing phones come first.
2. **Exceptions, not dashboards.** Owners should be interrupted only when judgment is needed.
3. **No recommendation without evidence.** Every action includes reason, confidence, risk and estimated impact.
4. **No invisible automation.** Actions are permissioned, bounded and reversible.
5. **Profit, not vanity metrics.** Marketing is evaluated by incremental contribution profit and operational impact.
6. **Restaurant truth beats demographic stereotypes.** Local context creates testable hypotheses; actual restaurant outcomes train the system.
7. **The platform must prove its value.** Predicted and realized outcomes are stored in the Profit Action Ledger.

## Repository structure

```text
public/                  Responsive PWA client
src/data/                Demonstration restaurant data
src/engine/              Profit, promotion and digital-twin logic
src/adapters/            Vendor-neutral integration contracts
src/platform/            Application state layer
server.js                Dependency-free HTTP and API server
test/                     Node test suite
docs/                     Architecture, integration and roadmap documentation
```

## Production path

The current repository is an executable product prototype and architecture foundation. It deliberately uses demonstration data and simulated publishing. Production development should proceed in this order:

1. Establish one independent restaurant design partner.
2. Implement one POS adapter, beginning with Square.
3. Import catalog, orders and modifiers into a normalized restaurant model.
4. Add invoice ingestion and human-verified recipe mapping.
5. Run recommendations in shadow mode before allowing execution.
6. Measure forecast accuracy, waste avoided, stockouts and realized contribution profit.
7. Add marketing publishing only after capacity and inventory guardrails are reliable.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/INTEGRATIONS.md`](docs/INTEGRATIONS.md) and [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Safety and limitations

ParPilot must not replace professional food-safety, legal, tax, accounting or employment guidance. Automated recommendations need restaurant-defined limits, audit logs and human override. The demo does not place supplier orders or publish public content.

## License

MIT
