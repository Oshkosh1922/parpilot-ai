# Integration Strategy

## Adapter-first design

External platforms should be isolated behind normalized adapter contracts. ParPilot's decision engine must not contain Square-, Toast-, Clover- or Meta-specific assumptions.

The prototype contracts are in `src/adapters/contracts.js`.

## Initial integration order

### 1. Square POS

Target data:

- locations
- catalog items, modifiers and categories
- completed orders and refunds
- inventory counts where available
- webhook events

Reason: independent-restaurant relevance and an accessible developer ecosystem.

### 2. Supplier inbox ingestion

Start without requiring supplier APIs:

- dedicated forwarding address
- invoice and order-confirmation extraction
- product alias resolution
- price history and expected-delivery tracking
- human verification queue

This works with existing supplier behavior and creates value before procurement automation.

### 3. Scheduling and timekeeping

Normalize:

- planned shifts
- actual punches
- roles and stations
- overtime rules
- employee availability

### 4. Accounting

Use posted accounting records for reconciliation and cash forecasting. The operational ledger should not claim realized savings until the relevant financial or inventory evidence is available.

### 5. Local marketing

Publishing must remain approval-based initially. Campaign decisions require:

- adequate inventory
- sufficient station and equipment capacity
- acceptable staffing
- positive modeled incremental contribution
- platform policy compliance
- automatic pause rules

## Legacy POS path

For systems without practical APIs, use a graduated fallback:

1. scheduled reports delivered by email
2. CSV/SFTP import
3. local read-only connector where permitted
4. integration middleware
5. direct certified integration

Screen scraping should not be the default because it is fragile and may violate platform terms.

## Data-quality gates

No automated purchasing or public campaign should run when:

- sales synchronization is stale
- recipe mapping confidence is low
- inventory is missing for high-value ingredients
- supplier pack-size conversion is unverified
- staff or equipment capacity is unknown
- forecast error exceeds restaurant policy

The interface should clearly display degraded or partial-data states.
