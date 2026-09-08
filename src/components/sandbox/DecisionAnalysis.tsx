"use client"

import { useMemo } from "react"
import { calculateDecisionScore, decisionObjective } from "@/engine/decisionScore"
import { derivedDecisionCandidates } from "@/engine/interventionRules"
import { formatCurrency, formatNumber } from "@/lib/format"
import { ImpactPanel } from "@/components/sandbox/ImpactPanel"
import type { CampusState, DecisionCandidate } from "@/types"

export type AnalysisTab = "compare" | "optimize" | "why" | "brief"
type DecisionAnalysisProps = { state: CampusState; activeTab: AnalysisTab; onTabChange: (tab: AnalysisTab) => void; guideStep?: number }

function scrollToAnalysis() { document.getElementById("decision")?.scrollIntoView({ behavior: "smooth", block: "start" }) }
function scoreCandidate(candidate: DecisionCandidate) { return calculateDecisionScore(candidate) }
const comparisonMetrics = ["affectedStudents", "conflicts", "recoveryHours", "stability", "roomUtilization", "transportLoad", "operationalCost"] as const

function DecisionMethodology() {
  return <details className="methodology"><summary>Decision methodology <span>VIEW WEIGHTS</span></summary><p>Each candidate is normalized against the operational objective. Higher is better; no weights are hidden.</p><div className="methodology-grid">{decisionObjective.map((item) => <div key={item.label}><span>{item.label}</span><strong>{item.weight}%</strong></div>)}</div></details>
}

export function DecisionAnalysis({ state, activeTab, onTabChange, guideStep }: DecisionAnalysisProps) {
  const best = useMemo(() => derivedDecisionCandidates.reduce((winner, candidate) => scoreCandidate(candidate).score > scoreCandidate(winner).score ? candidate : winner), [])
  const bestScore = scoreCandidate(best)
  const openTab = (tab: AnalysisTab) => { onTabChange(tab); scrollToAnalysis() }
  const nothing = derivedDecisionCandidates[0]

  return <section className="decision-panel panel section-anchor" id="decision">
    <div className="panel-header"><div className="panel-title"><span className="panel-code">05</span><h2>Intervention studio</h2></div><div className="analysis-tabs" role="tablist" aria-label="Decision analysis views">
      {(["compare", "optimize", "why", "brief"] as AnalysisTab[]).map((tab) => <button className={`analysis-tab ${guideStep === (tab === "compare" ? 6 : tab === "optimize" ? 7 : tab === "why" ? 8 : 0) ? "guide-focus" : ""}`} role="tab" type="button" aria-selected={activeTab === tab} key={tab} onClick={() => onTabChange(tab)}>{tab === "brief" ? "Brief" : tab === "why" ? "Why?" : tab}</button>)}
    </div></div>
    <div className="analysis-content" role="tabpanel">
      {activeTab === "compare" ? <div>
        <div className="analysis-intro"><div><h3>Compare interventions</h3><p>Same disruption. Different intervention. The score is derived from the operational objective.</p></div><span className="analysis-tag">CONTROLLED SYNTHETIC ANALYSIS</span></div>
        <div className="intervention-table-wrap"><table className="comparison-table intervention-table"><thead><tr><th scope="col">Metric</th>{derivedDecisionCandidates.map((candidate) => <th className={candidate.id === best.id ? "recommended" : ""} scope="col" key={candidate.id}>{candidate.label}</th>)}</tr></thead><tbody>
          {comparisonMetrics.map((metric) => <tr key={metric}><td>{metric === "affectedStudents" ? "Students affected" : metric === "recoveryHours" ? "Recovery" : metric === "roomUtilization" ? "Room utilization" : metric === "transportLoad" ? "Transport load" : metric === "operationalCost" ? "Estimated cost" : metric === "stability" ? "Campus stability" : "Faculty conflicts"}</td>{derivedDecisionCandidates.map((candidate) => <td className={candidate.id === best.id ? "recommended" : ""} key={candidate.id}>{metric === "operationalCost" ? formatCurrency(candidate[metric]) : metric === "recoveryHours" ? `${candidate[metric]}h` : metric === "roomUtilization" || metric === "transportLoad" ? `${candidate[metric]}%` : formatNumber(candidate[metric])}</td>)}</tr>)}
        </tbody></table></div>
        <div className="compare-callout"><span className="eyebrow">Current recommendation</span><strong>{best.label}</strong><span>{best.primaryTradeoff}</span></div>
        <div className="analysis-actions"><button className="primary-button" type="button" onClick={() => openTab("optimize")}>Optimize decision <span className="button-arrow">→</span></button></div>
      </div> : null}

      {activeTab === "optimize" ? <div className="optimization-grid">
        <div><div className="analysis-intro"><div><h3>Recommended intervention</h3><p>RIPPLE ranks candidates against visible stability, capacity, mobility, recovery and conflict priorities.</p></div><span className="analysis-tag">WEIGHTED OBJECTIVE</span></div>
          <div className="recommendation-box">
            <div className="recommendation-signal-row"><span className="eyebrow">LOWEST-RISK PATH</span><strong className="recommendation-score">{bestScore.score}<small>SCORE</small></strong></div>
            <h3 className="recommendation-insight">Absorb the disruption upstream</h3>
            <p className="recommendation-copy">{best.mechanism ?? best.description}</p>
            <div className="recommendation-metrics"><div className="recommendation-metric"><div className="metric-label">Students protected</div><div className="recommendation-metric-value">{formatNumber(nothing.affectedStudents - best.affectedStudents)}</div></div><div className="recommendation-metric"><div className="metric-label">Conflicts avoided</div><div className="recommendation-metric-value">{nothing.conflicts - best.conflicts}</div></div><div className="recommendation-metric"><div className="metric-label">Recovery improved</div><div className="recommendation-metric-value">{nothing.recoveryHours - best.recoveryHours}h</div></div><div className="recommendation-metric"><div className="metric-label">Est. operational cost</div><div className="recommendation-metric-value">{formatCurrency(best.operationalCost)}</div></div></div>
            <div className="recommendation-intervention"><span className="eyebrow">RECOMMENDED INTERVENTION</span><h3 className="recommendation-title">{best.label}</h3><p>{best.description}</p></div>
          </div>
          <DecisionMethodology />
        </div>
        <div className="score-card"><div className="eyebrow">Decision score</div><div className="score-number">{bestScore.score}<span>/100</span></div><div className="score-bars">{Object.entries(bestScore.subscores).map(([label, value]) => <div className="score-row" key={label}><span className="score-row-label">{label}</span><span className="score-track"><span className="score-fill" style={{ width: `${value}%` }} /></span><span className="score-row-value">{value}</span></div>)}</div><div className="scenario-footnote" style={{ marginTop: 18 }}>Normalized from controlled candidate metrics. Higher is better.</div></div>
        <div className="tradeoff-columns"><div><span className="eyebrow">Benefits</span>{best.benefits.map((benefit) => <p className="tradeoff-positive" key={benefit}>+ {benefit}</p>)}</div><div><span className="eyebrow">Trade-offs</span>{best.tradeoffs.map((tradeoff) => <p className="tradeoff-warning" key={tradeoff}>+ {tradeoff}</p>)}</div></div>
        <div className="analysis-actions full"><button className="secondary-button" type="button" onClick={() => openTab("why")}>Open WHY <span className="button-arrow">→</span></button></div>
      </div> : null}

      {activeTab === "why" ? <div className="why-grid">
        <div><div className="analysis-intro"><div><h3>Why this decision?</h3><p>A transparent explanation of how {best.label.toLowerCase()} changes the system.</p></div><span className="analysis-tag">STRUCTURED EXPLANATION</span></div><div className="why-list">{[
          `${state.scenario.targetLabel ?? "The selected target"} closure displaces a concentrated schedule of classes.`,
          "Without intervention, compatible rooms approach or exceed capacity thresholds.",
          "That pressure creates secondary faculty conflicts and longer recovery.",
          "Student movement adds transport load across the campus network.",
          `${best.label} reduces the cascade before it reaches the final stability threshold.`,
        ].map((copy, index) => <div className="why-item" key={copy}><span className="why-number">0{index + 1}</span><p className="why-copy">{copy}</p></div>)}</div></div>
        <div className="tradeoff-box"><div className="eyebrow">Primary trade-off</div><p>{best.primaryTradeoff}.</p><div className="scenario-footnote" style={{ borderTopColor: "rgba(242, 182, 109, 0.2)" }}>CURRENT SCENARIO<br /><span style={{ color: "var(--text)" }}>{state.scenario.targetLabel ?? state.scenario.buildingId.toUpperCase()} — {state.scenario.durationHours}H / {state.scenario.severity ?? 72}% SEVERITY</span></div></div>
        <div className="analysis-actions full"><button className="secondary-button" type="button" onClick={() => openTab("brief")}>Open decision brief <span className="button-arrow">→</span></button></div>
      </div> : null}

      {activeTab === "brief" ? <div className="decision-brief" id="decision-brief"><div className="brief-heading"><div><span className="eyebrow">RIPPLE / decision brief</span><h3>Make the next move legible.</h3><p>Decision summary for the active synthetic scenario.</p></div><span className="analysis-tag">HUMAN APPROVAL REQUIRED</span></div><div className="brief-grid"><div className="brief-primary"><span className="metric-label">Scenario</span><strong>{state.scenario.label ?? state.scenario.targetLabel ?? "Campus disruption"}</strong><span>{state.scenario.durationHours} hours / {state.scenario.severity ?? 72}% severity</span></div><div className="brief-primary brief-recommendation"><span className="metric-label">Recommended action</span><strong>{best.label}</strong><span>Decision score {bestScore.score} / 100</span></div><div className="brief-metric"><span className="metric-label">Students protected</span><strong>{formatNumber(nothing.affectedStudents - best.affectedStudents)}</strong></div><div className="brief-metric"><span className="metric-label">Conflicts avoided</span><strong>{nothing.conflicts - best.conflicts}</strong></div><div className="brief-metric"><span className="metric-label">Recovery improvement</span><strong>{nothing.recoveryHours - best.recoveryHours}h</strong></div><div className="brief-metric"><span className="metric-label">Estimated cost</span><strong>{formatCurrency(best.operationalCost)}</strong></div></div><div className="brief-why"><span className="eyebrow">Why this decision?</span><p>{best.primaryBenefit}. The recommendation protects system-wide stability while making the cost and operational complexity visible.</p></div><ImpactPanel metrics={state.metrics} /><div className="analysis-actions"><button className="secondary-button" type="button" onClick={() => { onTabChange("compare"); document.getElementById("campus")?.scrollIntoView({ behavior: "smooth", block: "start" }) }}>View simulation <span className="button-arrow">→</span></button></div></div> : null}
    </div>
  </section>
}
