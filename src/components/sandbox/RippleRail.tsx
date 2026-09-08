import { formatNumber, formatPercent, titleCase } from "@/lib/format"
import type { CampusMetrics, Building, SimulationEvent } from "@/types"

type RippleRailProps = { metrics: CampusMetrics; buildings: Building[]; activeNodeIndex: number; events: SimulationEvent[] }

type RippleNode = {
  id: string
  title: string
  value: (metrics: CampusMetrics, buildings: Building[]) => string
  severity: (metrics: CampusMetrics, buildings: Building[]) => string
}

const nodes: RippleNode[] = [
  { id: "building-failure", title: "Building Failure", value: (metrics, buildings) => { void metrics; return buildings.find((building) => building.id === "tt-block")?.status.toUpperCase() ?? "ONLINE" }, severity: () => "critical" },
  { id: "class-displacement", title: "Class Displacement", value: (metrics) => formatNumber(metrics.affectedStudents), severity: (metrics) => metrics.affectedStudents > 0 ? "warning" : "normal" },
  { id: "room-pressure", title: "Room Pressure", value: (metrics) => formatPercent(metrics.roomUtilization), severity: (metrics) => metrics.roomPressure },
  { id: "student-movement", title: "Student Movement", value: (metrics) => metrics.affectedStudents > 0 ? `${formatNumber(Math.round(metrics.affectedStudents * 0.82))}` : "0", severity: (metrics) => metrics.affectedStudents > 0 ? "elevated" : "normal" },
  { id: "faculty-conflict", title: "Faculty Conflict", value: (metrics) => String(metrics.conflicts), severity: (metrics) => metrics.conflicts > 0 ? "high" : "normal" },
  { id: "transport-load", title: "Transport Load", value: (metrics) => formatPercent(metrics.transportLoad), severity: (metrics) => metrics.transportPressure },
  { id: "campus-stability", title: "Campus Stability", value: (metrics) => String(metrics.campusStability), severity: (metrics) => metrics.campusStability < 60 ? "critical" : "normal" },
]

export function RippleRail({ metrics, buildings, activeNodeIndex, events }: RippleRailProps) {
  const activeEventCount = Math.max(0, activeNodeIndex + 1)
  return <div className="ripple-body">
    <div className="ripple-intro"><div className="ripple-intro-copy"><h3>Cause → ripple → consequence</h3><p>Each node activates from the same state transition that drives the map and KPI bar.</p></div>{activeNodeIndex >= 6 ? <div className="ripple-intro-status"><div className="ripple-state-label">Cascade state / <strong>complete</strong></div><div className="ripple-primary-outcome"><span>PRIMARY CONSEQUENCE / CAMPUS STABILITY</span><strong>{metrics.campusStability}</strong><small>CRITICAL / INDEX 100</small></div></div> : <div className="ripple-state-label">Cascade state / <strong>{activeNodeIndex < 0 ? "ready" : `${activeNodeIndex + 1} of 7 active`}</strong></div>}</div>
    <div className="ripple-rail" aria-label="Causal ripple sequence">
      {nodes.map((node, index) => {
        const active = index <= activeNodeIndex
        const severity = node.severity(metrics, buildings)
        return <div className={`ripple-node ${active ? "active" : ""} node-${severity}`} key={node.id}>
          <div className="ripple-node-index">0{index + 1}</div>
          <div className="ripple-node-title">{node.title}</div>
          <div className="ripple-node-value">{active ? node.value(metrics, buildings) : "—"}</div>
          <div className="ripple-node-status">{active ? titleCase(severity) : "Waiting"}</div>
        </div>
      }).flatMap((node, index) => index < nodes.length - 1 ? [node, <span className={`ripple-connector ${index < activeNodeIndex ? "active" : ""}`} aria-hidden="true" key={`connector-${index}`} />] : [node])}
    </div>
    {events.length === 0 ? <div className="ready-state">Ready. Run the TT Block scenario to reveal the causal sequence.</div> : <div className="event-stream" aria-live="polite">{events.map((event, index) => <div className={`event-item ${index <= activeNodeIndex ? "active" : ""}`} key={event.id}><div className="event-time">{event.timeLabel}</div><div className="event-title">{event.title}</div></div>)}</div>}
    {activeEventCount > 0 && activeEventCount < events.length ? <div className="sr-only">Simulation is progressing through event {activeEventCount} of {events.length}.</div> : null}
  </div>
}
