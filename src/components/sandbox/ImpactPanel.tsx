import { formatNumber, formatCurrency } from "@/lib/format"
import type { CampusMetrics } from "@/types"

export function ImpactPanel({ metrics }: { metrics: CampusMetrics }) {
  const items = [
    ["People affected", formatNumber(metrics.affectedStudents)],
    ["Person-hours disrupted", formatNumber(metrics.personHoursDisrupted)],
    ["Recovery time", `${metrics.recoveryHours}h`],
    ["Estimated cost", formatCurrency(metrics.estimatedOperationalCost)],
    ["Transport impact", `${metrics.transportImpact}%`],
    ["Energy impact", `${metrics.energyImpact} units`],
    ["Carbon impact", `${metrics.carbonImpact} kg-eq`],
  ]
  return <section className="impact-panel"><div className="impact-panel-header"><div><h3>Operational impact</h3><p>Demonstration estimates derived from the active deterministic scenario.</p></div><span className="analysis-tag">SYNTHETIC MODEL</span></div><div className="impact-grid">{items.map(([label, value]) => <div className="impact-item" key={label}><span className="metric-label">{label}</span><strong>{value}</strong></div>)}</div></section>
}
