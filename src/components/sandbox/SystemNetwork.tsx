import { formatPercent } from "@/lib/format"
import type { CampusMetrics, Building } from "@/types"

type SystemNetworkProps = { metrics: CampusMetrics; buildings: Building[]; activeNodeIndex: number }

const networkNodes = [
  { id: "building", label: "TT Block", sublabel: "SOURCE", x: 76, y: 116 },
  { id: "classes", label: "Classes", sublabel: "SCHEDULE", x: 236, y: 64 },
  { id: "rooms", label: "Rooms", sublabel: "CAPACITY", x: 236, y: 168 },
  { id: "students", label: "Students", sublabel: "MOVEMENT", x: 404, y: 64 },
  { id: "faculty", label: "Faculty", sublabel: "CONFLICTS", x: 404, y: 168 },
  { id: "transport", label: "Transport", sublabel: "LOAD", x: 570, y: 64 },
  { id: "stability", label: "Stability", sublabel: "OUTCOME", x: 570, y: 168 },
]

const connections = [
  [0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 5], [5, 6],
]

export function SystemNetwork({ metrics, buildings, activeNodeIndex }: SystemNetworkProps) {
  const sourceStatus = buildings.find((building) => building.id === "tt-block")?.status ?? "operational"
  const values = [sourceStatus.toUpperCase(), "RELEASED", formatPercent(metrics.roomUtilization), formatPercent(metrics.affectedStudents / 184.2), String(metrics.conflicts), formatPercent(metrics.transportLoad), String(metrics.campusStability)]

  return <div className="system-network">
    <div className="network-header"><div><h3>System network</h3><p>Operational dependencies illuminate in the order the model evaluates them.</p></div><span className="analysis-tag">DEPENDENCY VIEW</span></div>
    <svg className="network-svg" viewBox="0 0 660 232" role="img" aria-label="System dependency network from building closure to campus stability">
      <defs><linearGradient id="network-line" x1="0" x2="1"><stop offset="0" stopColor="var(--red)" /><stop offset="1" stopColor="var(--blue)" /></linearGradient></defs>
      {connections.map(([from, to], index) => { const source = networkNodes[from]; const target = networkNodes[to]; const active = index <= activeNodeIndex; return <line className={`network-connection ${active ? "active" : ""}`} key={`${from}-${to}`} x1={source.x + 46} y1={source.y + 22} x2={target.x - 12} y2={target.y + 22} /> })}
      {networkNodes.map((node, index) => { const active = index === 0 ? activeNodeIndex >= 0 : index - 1 <= activeNodeIndex; const critical = index === 0 && sourceStatus === "offline" || index === 6 && metrics.campusStability < 60; return <g className={`network-node ${active ? "active" : ""} ${critical ? "critical" : ""}`} key={node.id} transform={`translate(${node.x} ${node.y})`}><rect width="92" height="45" rx="2" /><circle cx="10" cy="11" r="3" /><text x="18" y="15" className="network-node-label">{node.label}</text><text x="10" y="34" className="network-node-value">{values[index]}</text><text x="102" y="15" className="network-node-sublabel">{node.sublabel}</text></g> })}
    </svg>
  </div>
}
