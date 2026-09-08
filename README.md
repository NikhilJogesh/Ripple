# RIPPLE

RIPPLE is a local-only decision-intelligence prototype for complex systems, beginning with a campus operations vertical.

It demonstrates one reliable loop:

`select a disruption → simulate the ripple → compare interventions → optimize → explain`

The application uses deterministic TypeScript simulation rules, synthetic local data, and no backend, authentication, persistence, external API, or AI service. The visible disclosure is intentional: the outputs are representative simulation data, not official operational telemetry.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3001` for the thesis page or `http://localhost:3001/sandbox` for the product surface.

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
```

The Tier 0 Golden Path is covered in `tests/golden-path.spec.ts`. The pure simulation engine and deterministic decision score are covered by unit tests.
