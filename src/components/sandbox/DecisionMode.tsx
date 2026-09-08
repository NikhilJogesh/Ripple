"use client"

import Link from "next/link"
import { calculateDecisionScore } from "@/engine/decisionScore"
import { derivedDecisionCandidates } from "@/engine/interventionRules"
import { syntheticDataDisclosure } from "@/data/mockData"
import { decisionOptionCandidates } from "@/lib/decisionSession"
import { formatNumber } from "@/lib/format"
import type { CampusState, DecisionBranch, DecisionCandidate, DecisionSession } from "@/types"
import { ViewSwitcher } from "@/components/sandbox/ViewSwitcher"

type DecisionModeProps = {
  state: CampusState
  session: DecisionSession
  onSelectBranch: (candidateId: DecisionCandidate["id"]) => void
  onSimulate: () => void
  onBacktrack: () => void
  onToggleCompare: (branchId: string) => void
  onReset: () => void
  onOpenOperations: () => void
}

const decisionCandidatesById = new Map(derivedDecisionCandidates.map((candidate) => [candidate.id, candidate]))

function candidateForBranch(branch: DecisionBranch) {
  return decisionCandidatesById.get(branch.candidateId) ?? decisionOptionCandidates[0]
}

function branchStatusLabel(branch: DecisionBranch, active: boolean) {
  if (branch.status === "complete") return active ? "SELECTED / EXPLORED" : "EXPLORED"
  if (branch.status === "running") return "CURRENT / SIMULATING"
  if (branch.status === "selected") return "CURRENT / READY"
  return "UNEXPLORED"
}

function DecisionHeader({ onReset }: { onReset: () => void }) {
  return <header className="focus-header decision-header">
    <Link href="/" aria-label="RIPPLE home" className="brand-lockup"><span className="brand-mark" /><span className="brand-name">RIPPLE</span></Link>
    <ViewSwitcher activeView="decision" />
    <div className="focus-header-actions"><Link className="focus-guided-link" href="/sandbox?guide=1">Guided demo <span>→</span></Link><button className="decision-reset" type="button" onClick={onReset}>Reset session</button><span className="focus-data-label">LOCAL / SYNTHETIC</span></div>
  </header>
}

function DecisionBranchNode({ branch, active, selectedForCompare, simulationRunning, onSelect, onToggleCompare }: { branch: DecisionBranch; active: boolean; selectedForCompare: boolean; simulationRunning: boolean; onSelect: () => void; onToggleCompare: () => void }) {
  const candidate = candidateForBranch(branch)
  const result = branch.result
  const status = branchStatusLabel(branch, active)
  return <article className={"decision-branch-node " + (active ? "active " : "") + (branch.status === "complete" ? "complete " : "") + (branch.status === "running" ? "running " : "") + (branch.status === "unexplored" ? "unexplored" : "")} data-testid={"decision-branch-" + candidate.id}>
    <button className="decision-node-button" type="button" onClick={onSelect} disabled={simulationRunning && !active} aria-pressed={active} aria-label={candidate.label + " future, " + status.toLowerCase()}>
      <span className="decision-node-status">{status}</span>
      <strong>{candidate.label}</strong>
      <span className="decision-node-description">{candidate.description}</span>
      {result ? <span className="decision-node-result"><span><b>{result.score}</b><small>score</small></span><span><b>{result.stability}</b><small>stability</small></span><span><b>{formatNumber(result.affectedStudents)}</b><small>affected</small></span><span><b>{result.recoveryHours}h</b><small>recovery</small></span></span> : <span className="decision-node-prompt">{active ? "Ready to simulate" : "Choose this future"} <b>→</b></span>}
    </button>
    {branch.status === "complete" ? <button className={"decision-compare-toggle " + (selectedForCompare ? "selected" : "")} type="button" onClick={onToggleCompare} aria-pressed={selectedForCompare}>{selectedForCompare ? "Selected for comparison" : "Add to comparison"}</button> : null}
  </article>
}

function DecisionCompare({ branches }: { branches: DecisionBranch[] }) {
  if (branches.length < 2) return <section className="decision-compare decision-compare-empty" data-testid="decision-compare" aria-label="Compare futures"><span className="decision-section-kicker">COMPARE FUTURES</span><strong>Explore one more response to unlock the comparison.</strong><p>Completed branches stay in the tree so you can return and select the futures that matter.</p></section>
  const labels = [
    { key: "stability", label: "Stability", format: (value: number) => String(value) },
    { key: "affectedStudents", label: "Students affected", format: formatNumber },
    { key: "conflicts", label: "Faculty conflicts", format: (value: number) => String(value) },
    { key: "recoveryHours", label: "Recovery", format: (value: number) => value + "h" },
  ] as const
  return <section className="decision-compare" data-testid="decision-compare" aria-labelledby="decision-compare-title">
    <div className="decision-section-heading"><div><span className="decision-section-kicker">COMPARE FUTURES / {branches.length} SELECTED</span><h2 id="decision-compare-title">Different responses. Measurable outcomes.</h2></div><span className="decision-section-note">Controlled synthetic analysis. Select branches above to change this view.</span></div>
    <div className="decision-compare-table-wrap"><table className="decision-compare-table"><thead><tr><th scope="col">Metric</th>{branches.map((branch) => <th scope="col" key={branch.id}>{candidateForBranch(branch).label}</th>)}</tr></thead><tbody>{labels.map((metric) => <tr key={metric.key}><th scope="row">{metric.label}</th>{branches.map((branch) => <td key={branch.id}>{metric.format(branch.result?.[metric.key] ?? 0)}</td>)}</tr>)}</tbody></table></div>
    {branches.length === 2 && <div className="decision-delta-strip"><span><b>{formatNumber(Math.abs((branches[0].result?.affectedStudents ?? 0) - (branches[1].result?.affectedStudents ?? 0)))}</b> students saved between futures</span><span><b>{Math.abs((branches[0].result?.conflicts ?? 0) - (branches[1].result?.conflicts ?? 0))}</b> conflicts avoided</span><span><b>{Math.abs((branches[0].result?.recoveryHours ?? 0) - (branches[1].result?.recoveryHours ?? 0))}h</b> recovery difference</span></div>}
  </section>
}

function DecisionRecommendation() {
  const best = derivedDecisionCandidates.reduce((winner, candidate) => calculateDecisionScore(candidate).score > calculateDecisionScore(winner).score ? candidate : winner)
  const nothing = derivedDecisionCandidates.find((candidate) => candidate.id === "do-nothing") ?? derivedDecisionCandidates[0]
  const score = calculateDecisionScore(best).score
  return <section className="decision-recommendation" data-testid="decision-recommendation" aria-labelledby="decision-recommendation-title"><div><span className="decision-section-kicker">RIPPLE RECOMMENDS</span><h2 id="decision-recommendation-title">{best.label}</h2><p>{best.primaryBenefit}. {best.primaryTradeoff}.</p></div><strong>{score}<small>/100</small></strong><div className="decision-recommendation-stats"><span><b>{formatNumber(nothing.affectedStudents - best.affectedStudents)}</b> students saved</span><span><b>{nothing.conflicts - best.conflicts}</b> conflicts avoided</span><span><b>{nothing.recoveryHours - best.recoveryHours}h</b> recovery gain</span></div></section>
}

function DecisionMechanism({ branch }: { branch: DecisionBranch }) {
  const candidate = candidateForBranch(branch)
  const result = branch.result
  return <section className="decision-mechanism" data-testid="decision-mechanism" aria-labelledby="decision-mechanism-title">
    <div className="decision-section-heading"><div><span className="decision-section-kicker">RULE PATH / ACTIVE FUTURE</span><h2 id="decision-mechanism-title">What I chose → how it works → what happens → outcome.</h2></div><span className="decision-section-note">Deterministic intervention rule. Synthetic calibration, not a forecast.</span></div>
    <div className="decision-mechanism-grid">
      <div className="decision-mechanism-step"><span className="decision-mechanism-index">01</span><span className="decision-mechanism-label">WHAT I CHOSE</span><strong>{candidate.label}</strong><p>{candidate.description}</p></div>
      <div className="decision-mechanism-step decision-mechanism-active"><span className="decision-mechanism-index">02</span><span className="decision-mechanism-label">HOW IT WORKS</span><strong>{candidate.mechanism ?? "The selected intervention rule is applied."}</strong><p>Applied before the cascade reaches the next node.</p></div>
      <div className="decision-mechanism-step"><span className="decision-mechanism-index">03</span><span className="decision-mechanism-label">WHAT HAPPENS</span><strong>{result ? `${formatNumber(result.affectedStudents)} students affected` : "Run this future to reveal the cascade."}</strong><p>{result ? `${result.roomUtilization}% room utilization · ${result.conflicts} faculty conflicts` : "The rule will resolve through the shared ripple sequence."}</p></div>
      <div className="decision-mechanism-step decision-mechanism-outcome"><span className="decision-mechanism-index">04</span><span className="decision-mechanism-label">OUTCOME</span><strong>{result ? `${result.stability} stability / 100` : "Awaiting deterministic result"}</strong><p>{result ? `Decision score ${result.score}/100 · ${result.recoveryHours}h recovery` : "No result is committed until simulation completes."}</p></div>
    </div>
  </section>
}

function DecisionWhy({ scenarioTarget }: { scenarioTarget: string }) {
  const chain = [scenarioTarget + " closes", "Classes are displaced", "Room pressure rises", "Students redistribute", "Faculty conflicts increase", "Transport pressure rises", "Campus stability falls"]
  return <section className="decision-why" data-testid="decision-why" aria-labelledby="decision-why-title"><div className="decision-section-heading"><div><span className="decision-section-kicker">WHY / CAUSAL EXPLANATION</span><h2 id="decision-why-title">The better future intervenes upstream.</h2></div><span className="decision-section-note">No hidden scoring. No generated explanation.</span></div><div className="decision-why-layout"><div className="decision-causal-chain">{chain.map((item, index) => <div key={item}><span>0{index + 1}</span><strong>{item}</strong>{index < chain.length - 1 ? <b>↓</b> : null}</div>)}</div><div className="decision-why-callout"><span className="decision-section-kicker">INTERVENTION</span><strong>Dynamic Reallocation absorbs the cascade upstream.</strong><p>Compatible rooms are assigned before pressure becomes a downstream faculty, mobility, and stability problem.</p></div></div></section>
}

export function DecisionMode({ state, session, onSelectBranch, onSimulate, onBacktrack, onToggleCompare, onReset, onOpenOperations }: DecisionModeProps) {
  const activeBranch = session.branches.find((branch) => branch.id === session.activeBranchId)
  const completedBranches = session.branches.filter((branch) => branch.status === "complete")
  const selectedBranches = session.selectedBranchIds.map((id) => session.branches.find((branch) => branch.id === id)).filter((branch): branch is DecisionBranch => Boolean(branch?.result && branch.status === "complete"))
  const displayedBranches = selectedBranches.length > 0 ? selectedBranches : completedBranches
  const target = state.scenario.targetLabel ?? "TT Block"
  const simulationRunning = state.phase === "running"
  const contextLabel = state.scenario.label ?? target + " closure"
  const phaseLabel = simulationRunning ? "SIMULATION RUNNING" : state.phase === "complete" ? "SCENARIO COMPLETE" : "EXPLORATION READY"

  return <main className="decision-shell" data-testid="decision-mode">
    <DecisionHeader onReset={onReset} />
    <div className="decision-main">
      <div className="decision-hero"><div><span className="focus-eyebrow">RIPPLE / DECISION MODE</span><h1>Explore possible futures before you act.</h1><p className="focus-lede">Choose a response, run the model, and backtrack without losing what you have learned.</p></div><div className={"decision-phase " + (simulationRunning ? "running" : completedBranches.length > 0 ? "complete" : "")} role="status" aria-live="polite"><span />{phaseLabel}</div></div>
      <section className="decision-context" aria-label="Current decision context"><div><span className="decision-section-kicker">CURRENT SCENARIO</span><strong>{contextLabel}</strong><small>{state.scenario.durationHours} hours / {state.scenario.startTime} start</small></div><div><span className="decision-section-kicker">DECISION POINT</span><strong>{activeBranch ? activeBranch.status === "complete" ? "Review this explored future" : "Choose a response" : completedBranches.length > 0 ? "Choose another response" : "What should we do?"}</strong><small>{completedBranches.length} of {session.branches.length} futures explored</small></div><div><span className="decision-section-kicker">SESSION</span><strong>In memory only</strong><small>Reset clears this exploration</small></div></section>

      <section className="decision-tree-panel" data-testid="decision-tree" aria-labelledby="decision-tree-title"><div className="decision-section-heading"><div><span className="decision-section-kicker">FUTURE TREE / LIVE SESSION</span><h2 id="decision-tree-title">Follow the decision, not just the outcome.</h2></div><p className="decision-section-note">Each completed branch stays available for comparison. Intervention rules resolve every future deterministically.</p></div><div className="decision-tree" role="group" aria-label="Possible futures for the current scenario"><div className="decision-root-node"><span className="decision-node-status">STARTING CONDITION</span><strong>{contextLabel}</strong><small>{state.scenario.durationHours} hours unavailable</small></div><div className="decision-tree-trunk" aria-hidden="true" /><div className="decision-branch-grid">{session.branches.map((branch) => <DecisionBranchNode branch={branch} active={session.activeBranchId === branch.id} selectedForCompare={session.selectedBranchIds.includes(branch.id)} simulationRunning={simulationRunning} onSelect={() => onSelectBranch(branch.candidateId)} onToggleCompare={() => onToggleCompare(branch.id)} key={branch.id} />)}</div></div><div className="decision-tree-actions">{activeBranch ? <button className="decision-secondary-button" type="button" onClick={onBacktrack} disabled={simulationRunning && activeBranch.status !== "running"}>← Back to decision</button> : <span className="decision-tree-hint">Select a response to create the next branch.</span>}{activeBranch && activeBranch.status !== "complete" && !simulationRunning ? <button className="decision-primary-button" type="button" onClick={onSimulate}>Simulate this future <span>→</span></button> : null}{activeBranch?.status === "complete" ? <button className="decision-primary-button" type="button" onClick={onBacktrack}>Try another path <span>→</span></button> : null}{state.phase === "running" ? <span className="decision-running-note">The shared ripple is running. Reset remains safe.</span> : null}</div></section>

      {activeBranch ? <DecisionMechanism branch={activeBranch} /> : null}
      {completedBranches.length > 0 ? <DecisionCompare branches={displayedBranches} /> : null}
      {completedBranches.length >= 2 ? <DecisionRecommendation /> : null}
      {completedBranches.length > 0 ? <DecisionWhy scenarioTarget={target} /> : null}
      <div className="decision-footer-actions"><button className="decision-secondary-button" type="button" onClick={onOpenOperations}>Open Operations <span>→</span></button><button className="decision-text-link" type="button" onClick={onReset}>Reset scenario and session</button></div>
      <p className="focus-footer-disclosure">{syntheticDataDisclosure}</p>
    </div>
  </main>
}
