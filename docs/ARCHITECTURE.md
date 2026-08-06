# Architecture

## Product boundary

ParPilot is a coordination and decision layer. It should not attempt to replace every POS, scheduler, accounting package or supplier portal. It converts their data into a normalized Restaurant Graph, generates bounded actions, executes approved actions through adapters and measures outcomes.

```text
Existing systems
POS | invoices | schedules | accounting | delivery | reviews | weather | events
        ↓
Connector and normalization fabric
        ↓
Restaurant Graph / digital twin
        ↓
Forecasting + optimization + policy engine
        ↓
Profit Action Ledger
        ↓
Approval or bounded automation
        ↓
Existing systems
```

## Core domains

### Restaurant Graph

A versioned relationship model containing:

- locations and service windows
- menu items, modifiers, recipes and sub-recipes
- ingredients, units, pack sizes, lots and shelf life
- suppliers, prices, substitutions, lead times and delivery reliability
- stations, equipment, throughput and dependencies
- employees, roles, certifications and station skills
- sales channels, fees, demand and fulfillment limits
- campaigns, offers and measured incremental outcomes

Every relationship needs a confidence score and provenance. Human corrections must be retained as training and audit events.

### Decision engine

Numerical decisions should be produced by forecasting and optimization components, not by a language model. A language model can:

- extract and map unstructured documents
- propose recipe and vendor aliases
- explain structured recommendations
- generate approved campaign copy
- translate procedures
- answer questions using grounded restaurant data

### Policy engine

Every executable action must pass restaurant-defined policy:

- maximum purchase value
- permitted suppliers and substitutions
- discount and campaign limits
- kitchen and labor capacity thresholds
- stockout and waste tolerances
- employee and owner approval roles
- food-safety constraints
- quiet hours and escalation paths

### Profit Action Ledger

Each action records:

- evidence snapshot
- expected result and confidence interval
- risk and policy evaluation
- approver and execution status
- external system response
- realized financial outcome
- operational guardrail outcome
- model calibration update

## Production service boundaries

The dependency-free prototype can evolve into independently deployable services:

- `gateway`: authentication, tenants, roles and API routing
- `connectors`: POS and third-party data synchronization
- `graph`: normalized restaurant entities and provenance
- `forecasting`: menu, ingredient, labor and cash forecasts
- `optimizer`: purchase, prep, labor and campaign decisions
- `policy`: approval and automation boundaries
- `ledger`: immutable action and outcome history
- `intelligence`: document extraction, explanations and content generation
- `notifications`: mobile, email, SMS and in-product exceptions

A PostgreSQL database with tenant isolation is appropriate initially. Event processing can begin with a durable job queue and move to a streaming architecture only when transaction volume requires it.

## Security requirements

- OAuth and least-privilege scopes for every connector
- encrypted secrets and tenant data
- immutable audit trail for writes and approvals
- idempotency keys for financial or public actions
- signed webhook verification
- role-based approval thresholds
- data retention controls
- no sensitive individual targeting from demographic data
- vendor and model outputs treated as untrusted input

## Hardware philosophy

### Layer 0: existing infrastructure

The required platform must work using existing software, supplier email, phones, tablets and browser access.

### Layer 1: inexpensive optional sensing

Only after measured value:

- temperature tags
- QR or NFC station labels
- Bluetooth receiving scales
- inexpensive label printers where useful

### Layer 2: advanced automation

Reserved for operators with enough scale to justify it:

- equipment telemetry
- fixed computer vision
- automated storage sensing
- robotics integrations

The business should never depend on restaurant-wide hardware replacement for initial adoption.
