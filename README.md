# ParPilot

**The cloud operating standard for building, opening, running, and growing exceptional restaurants.**

ParPilot is designed as one continuous restaurant model rather than another disconnected dashboard. It begins with an aspiring owner's dream, helps shape the concept and safest facility path, carries the plan through funding and opening, then becomes the live decision and guest-experience layer of the restaurant.

## Product experiences

### Public product presentation — `/`

A polished product narrative and transparent ROI model.

### Venture and Activation Concierge — `/start`

A six-stage interactive setup for three restaurant journeys:

- **Aspiring owner:** vision, market, facility or food-truck path, funding room, professional team, guest standard, and first 30 days
- **Opening team:** launch dependencies, evidence, milestones, and opening command
- **Existing restaurant:** read-only connections, Restaurant Graph mapping, confidence-based verification, shadow mode, and bounded activation

### Restaurant Command Center — `/app`

- daily Profit Actions
- forecasting and capacity
- LocalPulse marketing
- Restaurant Graph digital twin
- Launch Mode
- integrations and hardware strategy

### Invisible Guest Experience — `/guest`

- honest wait promises
- truthful menu availability
- opt-in hospitality memory
- private in-visit feedback
- proactive service recovery

## Run locally

Requirements: Node.js 20+

```bash
npm start
```

Open:

- `http://localhost:3000/`
- `http://localhost:3000/start`
- `http://localhost:3000/app`
- `http://localhost:3000/guest`

## Validation

```bash
npm test
npm run check
```

The release includes nine automated tests covering profitability logic, promotion capacity, LocalPulse, launch economics, facility-path adaptation, zero-disruption activation, service recovery, and ROI transparency.

## Cloud deployment

The repository includes `api/index.js` and `vercel.json` for Vercel deployment. Add environment variables from `.env.example`, connect a production database, and register provider OAuth redirect URLs before activating live integrations.

## Production activation path

1. Deploy presentation mode and connect the domain.
2. Add PostgreSQL/Supabase tenancy and authentication.
3. Add one Square design partner in read-only shadow mode.
4. Add supplier invoice forwarding and verified menu/recipe mapping.
5. Add Google Maps/Census and commercial listing partners for live facility research.
6. Add Meta and Google Business Profile publishing only after operational guardrails are reliable.
7. Measure all claimed value through the Profit Action Ledger.

See:

- [`docs/PRODUCT.md`](docs/PRODUCT.md)
- [`docs/ONBOARDING.md`](docs/ONBOARDING.md)
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/INTEGRATIONS.md`](docs/INTEGRATIONS.md)
- [`docs/PRODUCTION-CHECKLIST.md`](docs/PRODUCTION-CHECKLIST.md)
- [`docs/ROADMAP.md`](docs/ROADMAP.md)

## Important boundary

The current repository is a presentation-ready executable product and production architecture foundation. It is not yet a fully live multi-tenant restaurant service: real authentication, database persistence, provider credentials, platform reviews, current property feeds, and design-partner validation are still required.

ParPilot must not replace qualified legal, accounting, lending, commercial real-estate, licensing, employment, food-safety, or accessibility professionals.

## License

MIT
