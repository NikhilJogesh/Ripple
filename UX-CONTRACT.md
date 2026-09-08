# RIPPLE Behavior Contract

## Canonical UI Map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Select/Listbox | Native labelled select in `ScenarioPanel` | This contract and `premium-ui.json` | Native platform popup | Keyboard selection and Golden Path E2E |
| Scrollbar | Global application stylesheet in `globals.css` | `DESIGN.md` tokens | Density inherited by scrollable surfaces | Static audit and rendered browser inspection |
| Simulation actions | Shared buttons in `ScenarioPanel` and sandbox header | This contract | Primary scenario action / compact toolbar action | Unit, integration, and Golden Path E2E |
| Building selection | Accessible SVG building interaction in `CampusMap` | This contract | Pointer and keyboard selection | Keyboard browser inspection and E2E |
| Analysis views | Shared tablist in `DecisionAnalysis` | This contract | Compare / Optimize / WHY / Brief | E2E and visible panel inspection |
| Scenario presets | `ScenarioLibrary` | `src/data/mockData.ts` | Load a deterministic preset into the builder | E2E and rendered inspection |
| What If | `WhatIfPanel` | Pure `runSimulation()` call | Preview a duration, then explicitly apply it | E2E and unit engine coverage |
| Trust and history | `TrustPanel` / `HistoryPanel` | Synthetic disclosure and provider state | Local-only confidence context and replayable session history | Static audit and rendered inspection |
| View mode | `ViewSwitcher` | Shared `CampusStateProvider` | Focus / Decision / Operations presentation | Focus, Decision, and Golden Path E2E |
| Decision session | `useCampusState()` decision actions | In-memory `decisionSession` above the simulation engine | Select branch / Back / Try another path / Reset session | Decision E2E and reset/re-run coverage |
| Focus scenario choice | `FocusMode` | `scenarioPresets` and `loadScenario()` | Building closure / transport disruption / weather event | Focus E2E and keyboard inspection |

## Canonical workflow

`/` introduces the RIPPLE thesis and links to Focus at `/sandbox`. Focus asks “What decision do you want to test?” and keeps the Golden Path available as a progressive flow: choose a real preset, configure the closure, simulate, inspect the live result, compare interventions, and open WHY. Decision at `/sandbox?view=decision` is the branching-futures workspace: choose a response, simulate it, backtrack to the decision point, preserve explored branches, compare selected futures, and read WHY. Operations at `/sandbox?view=operations` exposes the full map, ripple, timeline, library, What If, history, and analysis. Scenario presets and What If are supporting paths that never replace the primary flow.

View switching changes presentation, not state. The provider remains shared while changing `view`; the deterministic simulation, snapshots, history, reset safety, completed metrics, and in-memory decision session are the same source of truth. Guided Demo continues to use `/sandbox?guide=1` and intentionally forces Operations so the tutorial can point at real controls.

## Simulation lifecycle

- `idle`: baseline metrics and operational buildings.
- `running`: snapshots reveal in order; scenario inputs and Simulate are disabled; Pause and Reset remain available.
- `paused`: the current snapshot remains visible; Resume continues the remaining snapshots, while changing a scenario input returns to the baseline before editing continues.
- `complete`: the final snapshot is stable; Run and Simulate are disabled until Reset, so a new run cannot accidentally reuse stale results.
- `reset`: clears timers and presentation state, then restores the exact baseline.
- `history`: a completed run is recorded locally in the current session and can be replayed by loading its original scenario inputs; it does not persist to a backend.

## Controls and ownership

- Scenario selects are labelled native `<select>` controls.
- Actions use semantic buttons with visible focus, disabled, busy, and pressed states.
- Building selection is keyboard accessible and exposes `aria-pressed`.
- Comparison, optimization, and WHY are structured panels, not conversational UI. Optimize presents the lowest-risk path insight, its mechanism, deterministic evidence metrics, the named intervention, and its score in that order; the score and candidate values remain unchanged.
- Inline status text is the source of truth for simulation state; animation is enhancement only.
- The guided demo is an overlay over real controls. It may advance the presentation, but it cannot mutate simulation state through fake controls.
- Focus uses real preset selection, native labelled controls, and the shared `loadScenario`, `updateScenario`, and `simulate` actions. Its configuration maps every existing `ScenarioKind` to scenario-appropriate fields: building closures expose a building selector; non-building scenarios expose their existing target readout, duration, and exact load/severity without a generic building control. The ready summary, simulation heading, and result heading all read from that same scenario object. Its “Try another scenario” action resets the shared state before returning to the picker.
- Focus WHY and Compare are local presentation panels. “View detailed WHY”, “View full comparison”, and “Explore system” route to Operations and preserve the active provider state.
- Decision uses the shared simulation lifecycle for each selected branch. The causal timing comes from the deterministic engine; candidate outcome metrics are resolved by explicit intervention rules in `src/engine/interventionRules.ts` from the controlled synthetic closure baseline, not predictive forecasts. The active branch presents the chosen intervention, its mechanism, the derived consequence, and the committed outcome in that order. `Back to decision` cancels an active presentation and returns to the root decision point without removing completed branches. `Try another path` is the completed-branch version of the same backtrack action. `Reset scenario and session` clears both the shared simulation and the in-memory decision tree.
- Compare and Optimize remain available after completion; changing a scenario after completion returns the operational state to baseline before another run.

## Responsive behavior

Desktop prioritizes the map and scenario controls side by side. The Operations header keeps brand, primary navigation, view mode, and runtime controls in separate layout zones; medium widths stack those zones by row and narrow widths wrap them into a single-column header. Narrow layouts stack the map, controls, ripple, comparison, and decision panels without horizontal page overflow or a horizontally scrolling header.

## Data policy

Operational KPIs derive from the deterministic engine. Comparison and optimization candidates are controlled synthetic analysis in `src/data/mockData.ts` and are labelled as representative, not official data. No backend, authentication, persistence, external API, random number, or AI claim is part of the MVP.

## Accessibility and motion

- Use semantic buttons, native labelled selects, keyboard-accessible building controls, visible focus, and text labels alongside color states.
- The dependency graph may preserve a bounded horizontal scroll surface on narrow screens because its topology is intrinsically wide; the page itself must not overflow.
- `prefers-reduced-motion` shortens or removes decorative transitions while retaining the same state changes and event order.
