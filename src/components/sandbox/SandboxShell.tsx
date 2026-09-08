"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CampusStateProvider, useCampusState } from "@/hooks/useCampusState"
import { formatSimulationClock } from "@/lib/format"
import { CampusMap } from "@/components/sandbox/CampusMap"
import { BuildingProfile } from "@/components/sandbox/BuildingProfile"
import { DecisionAnalysis, type AnalysisTab } from "@/components/sandbox/DecisionAnalysis"
import { GuidedDemo } from "@/components/sandbox/GuidedDemo"
import { HistoryPanel } from "@/components/sandbox/HistoryPanel"
import { KpiBar } from "@/components/sandbox/KpiBar"
import { RippleRail } from "@/components/sandbox/RippleRail"
import { ScenarioLibrary } from "@/components/sandbox/ScenarioLibrary"
import { ScenarioPanel } from "@/components/sandbox/ScenarioPanel"
import { SimulationTimeline } from "@/components/sandbox/SimulationTimeline"
import { SystemNetwork } from "@/components/sandbox/SystemNetwork"
import { TrustPanel } from "@/components/sandbox/TrustPanel"
import { WhatIfPanel } from "@/components/sandbox/WhatIfPanel"
import { scenarioPresets, syntheticDataDisclosure } from "@/data/mockData"
import { FocusMode } from "@/components/sandbox/FocusMode"
import { DecisionMode } from "@/components/sandbox/DecisionMode"
import { ViewSwitcher, type SandboxView } from "@/components/sandbox/ViewSwitcher"

function SandboxWorkspace({ initialGuide, view }: { initialGuide: boolean; view: SandboxView }) {
  const router = useRouter()
  const { state, isSimulationRunning, selectBuilding, updateScenario, loadScenario, simulate, pause, reset, selectDecisionBranch, backtrackDecision, toggleDecisionBranch } = useCampusState()
  const [analysisTab, setAnalysisTab] = useState<AnalysisTab>("compare")
  const [guideOpen, setGuideOpen] = useState(initialGuide)
  const [guideStep, setGuideStep] = useState(1)
  const selectedBuilding = useMemo(() => state.buildings.find((building) => building.id === state.selectedBuildingId), [state.buildings, state.selectedBuildingId])
  const activeNodeIndex = state.snapshots.length > 0 ? state.snapshots[state.activeSnapshotIndex]?.activeNodeIndex ?? -1 : -1
  const statusLabel = state.phase === "running" ? "RIPPLE RUNNING" : state.phase === "complete" ? "RIPPLE COMPLETE" : state.phase === "paused" ? "RIPPLE PAUSED" : `RIPPLE ${formatSimulationClock(state.simulationTimeMinutes)}`
  const activeGuideStep = guideOpen && guideStep === 4 && state.phase === "complete" ? 5 : guideStep

  const handleSelectBuilding = (buildingId: string) => {
    selectBuilding(buildingId)
    updateScenario({ buildingId, targetLabel: state.buildings.find((building) => building.id === buildingId)?.name, label: `${state.buildings.find((building) => building.id === buildingId)?.name ?? "Building"} Closure`, kind: "building-closure", category: "INFRASTRUCTURE" })
    if (guideOpen && activeGuideStep === 2 && buildingId === "tt-block") setGuideStep(3)
  }

  const handleUpdateScenario = (patch: Parameters<typeof updateScenario>[0]) => {
    updateScenario(patch)
    if (guideOpen && activeGuideStep === 3 && patch.durationHours === 6) setGuideStep(4)
  }

  const handleSimulate = () => {
    simulate()
  }

  const handleChooseScenario = (scenario: Parameters<typeof loadScenario>[0]) => {
    loadScenario(scenario)
  }

  const handleOpenOperations = (tab?: AnalysisTab) => {
    if (tab) setAnalysisTab(tab)
    router.push(`/sandbox?view=operations${tab ? "#decision" : ""}`, { scroll: false })
  }

  const handleOpenDecision = () => {
    router.push("/sandbox?view=decision", { scroll: false })
  }

  const handleAnalysisTab = (tab: AnalysisTab) => {
    setAnalysisTab(tab)
    if (guideOpen && activeGuideStep === 5 && tab === "compare") setGuideStep(6)
    if (guideOpen && activeGuideStep === 6 && tab === "compare") setGuideStep(7)
    if (guideOpen && activeGuideStep === 7 && tab === "optimize") setGuideStep(8)
  }

  const handleGuideNavigate = (tab: AnalysisTab) => {
    handleAnalysisTab(tab)
    requestAnimationFrame(() => document.getElementById("decision")?.scrollIntoView({ behavior: "smooth", block: "start" }))
  }

  const handleGuideExit = () => {
    setGuideOpen(false)
    setGuideStep(1)
    router.replace("/sandbox", { scroll: false })
  }

  if (!initialGuide && view === "focus") return <FocusMode state={state} buildings={state.buildings} onSelectBuilding={handleSelectBuilding} onUpdateScenario={handleUpdateScenario} onSimulate={handleSimulate} onReset={reset} onChooseScenario={handleChooseScenario} onOpenOperations={handleOpenOperations} onOpenDecision={handleOpenDecision} />
  if (!initialGuide && view === "decision") return <DecisionMode state={state} session={state.decisionSession} onSelectBranch={selectDecisionBranch} onSimulate={simulate} onBacktrack={backtrackDecision} onToggleCompare={toggleDecisionBranch} onReset={reset} onOpenOperations={() => handleOpenOperations()} />

  return <main className="sandbox-shell">
    <header className="sandbox-header">
      <div className="brand-lockup"><Link href="/" aria-label="RIPPLE home" className="brand-mark" /><span className="brand-name">RIPPLE</span><span className="brand-subtitle">Decision intelligence / Campus vertical</span></div>
      <nav className="sandbox-nav" aria-label="Sandbox sections"><a href="#campus">Overview</a><a href="#campus">Campus</a><a href="#scenario">Scenario</a><a href="#what-if">What if?</a><a href="#ripple">Network</a><a href="#decision">Decisions</a><a href="#decision-brief">Brief</a></nav><ViewSwitcher activeView="operations" />
      <div className="sandbox-header-actions"><span className={`live-status ${state.phase}`} role="status" aria-live="polite" aria-atomic="true"><span className="status-dot" />{statusLabel}</span><button className="ghost-button compact-action" type="button" onClick={isSimulationRunning ? pause : simulate} disabled={state.phase === "complete"} title={state.phase === "complete" ? "Reset before running another simulation" : undefined}>{isSimulationRunning ? "Pause" : state.phase === "paused" ? "Resume" : "Run"}</button><button className="secondary-button compact-action" type="button" onClick={reset}>Reset</button></div>
    </header>

    <div className="sandbox-main">
      <div className="product-positioning"><span>RIPPLE / DECISION INTELLIGENCE FOR COMPLEX SYSTEMS</span><span>BUILT FOR CAMPUS OPERATIONS TODAY / DESIGNED TO EXTEND</span></div>
      <div className="demo-disclosure">{syntheticDataDisclosure}</div>
      <KpiBar metrics={state.metrics} />
      <div className="primary-grid section-anchor" id="campus">
        <section className="map-panel panel"><div className="panel-header"><div className="panel-title"><span className="panel-code">01</span><h2>Campus system</h2></div><div className="map-legend"><span className="legend-item"><span className="legend-mark operational" />Operational</span><span className="legend-item"><span className="legend-mark selected" />Selected</span><span className="legend-item"><span className="legend-mark affected" />Affected</span><span className="legend-item"><span className="legend-mark offline" />Offline</span></div></div><div className="panel-body"><CampusMap buildings={state.buildings} selectedBuildingId={state.selectedBuildingId} onSelect={handleSelectBuilding} guideStep={guideOpen ? activeGuideStep : undefined} /><div className="map-footnote">Select a building to define the source of the disruption</div><div className="map-scale"><span className="map-scale-line" />100m</div></div></section>
        <div className="side-stack section-anchor" id="scenario"><ScenarioPanel buildings={state.buildings} scenario={state.scenario} phase={state.phase} simulationTimeMinutes={state.simulationTimeMinutes} onSelectBuilding={handleSelectBuilding} onUpdateScenario={handleUpdateScenario} onSimulate={handleSimulate} guideStep={guideOpen ? activeGuideStep : undefined} /><section className="profile-panel panel"><div className="panel-header"><div className="panel-title"><span className="panel-code">01A</span><h2>Building profile</h2></div><span className="status-label">CONTEXT</span></div><div className="panel-body"><BuildingProfile building={selectedBuilding} metrics={state.metrics} /></div></section></div>
      </div>

      <div className="support-grid"><ScenarioLibrary presets={scenarioPresets} activePresetId={state.scenario.presetId} onSelect={(preset) => loadScenario(preset.scenario)} /><WhatIfPanel scenario={state.scenario} onApplyDuration={(durationHours) => handleUpdateScenario({ durationHours })} /></div>

      <section className="ripple-panel panel section-anchor" id="ripple"><div className="panel-header"><div className="panel-title"><span className="panel-code">03</span><h2>Ripple network</h2></div><span className="status-label">CAUSAL SYSTEM</span></div><RippleRail metrics={state.metrics} buildings={state.buildings} activeNodeIndex={activeNodeIndex} events={state.events} /><SystemNetwork metrics={state.metrics} buildings={state.buildings} activeNodeIndex={activeNodeIndex} /><SimulationTimeline events={state.events} activeNodeIndex={activeNodeIndex} /></section>
      <DecisionAnalysis state={state} activeTab={analysisTab} onTabChange={handleAnalysisTab} guideStep={guideOpen ? guideStep : undefined} />
      <TrustPanel />
      <HistoryPanel history={state.scenarioHistory} onReplay={(item) => loadScenario(item.scenario)} />
      <p className="footer-disclosure">RIPPLE / DETERMINISTIC DECISION INTELLIGENCE / REPRESENTATIVE SYNTHETIC MODEL / HUMAN APPROVAL REQUIRED</p>
    </div>
    <GuidedDemo open={guideOpen} step={activeGuideStep} state={state} analysisTab={analysisTab} onStepChange={setGuideStep} onNavigate={handleGuideNavigate} onExit={handleGuideExit} />
  </main>
}

export function SandboxShell({ initialGuide = false, initialView = "focus" }: { initialGuide?: boolean; initialView?: SandboxView }) {
  const activeView = initialGuide ? "operations" : initialView
  return <CampusStateProvider key={initialGuide ? "guided-provider" : "sandbox-provider"}><SandboxWorkspace initialGuide={initialGuide} view={activeView} /></CampusStateProvider>
}
