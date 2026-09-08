import { formatNumber, formatPercent } from "@/lib/format"
import type { Building, CampusMetrics } from "@/types"

type BuildingProfileProps = { building: Building | undefined; metrics: CampusMetrics }

export function BuildingProfile({ building, metrics }: BuildingProfileProps) {
  if (!building) {
    return <div className="profile-empty">Select a building on the campus plan to inspect its operational profile.</div>
  }

  const isTtBlock = building.id === "tt-block"
  const affected = isTtBlock ? metrics.affectedStudents : 0
  const utilization = isTtBlock && metrics.affectedStudents > 0 ? metrics.roomUtilization : Math.round((building.scheduledStudents / building.capacity) * 100)
  const conflicts = isTtBlock ? metrics.conflicts : 0

  return <>
    <div className="profile-hero">
      <div><div className="profile-code">{building.code} / {building.zone}</div><h3 className="profile-name">{building.name}</h3></div>
      <span className={`status-badge ${building.status}`}><span className="status-dot" />{building.status}</span>
    </div>
    <p className="profile-description">{building.description}</p>
    <div className="profile-stats">
      <div className="profile-stat"><div className="metric-label">Affected</div><div className="profile-stat-value">{formatNumber(affected)}</div></div>
      <div className="profile-stat"><div className="metric-label">Rooms</div><div className="profile-stat-value">{building.roomCount}</div></div>
      <div className="profile-stat"><div className="metric-label">Utilization</div><div className={`profile-stat-value ${utilization >= 90 ? "warning" : ""}`}>{formatPercent(utilization)}</div></div>
      <div className="profile-stat"><div className="metric-label">Conflicts</div><div className={`profile-stat-value ${conflicts > 0 ? "critical" : ""}`}>{conflicts}</div></div>
    </div>
  </>
}
