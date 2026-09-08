export type BuildingStatus = "operational" | "selected" | "affected" | "offline" | "warning" | "critical"

export type Severity = "normal" | "elevated" | "high" | "critical"

export type SimulationPhase = "idle" | "running" | "paused" | "complete"

export type ScenarioCategory = "INFRASTRUCTURE" | "WEATHER" | "OPERATIONS" | "CAPACITY" | "TRANSPORT"

export type ScenarioKind = "building-closure" | "transport-capacity" | "weather-event" | "campus-event" | "network-disruption"

export type AffectedSystem = "classes" | "rooms" | "students" | "faculty" | "transport"

export type Scenario = {
  buildingId: string
  condition: "close"
  durationHours: number
  startTime: string
  severity?: number
  affectedSystems?: AffectedSystem[]
  kind?: ScenarioKind
  category?: ScenarioCategory
  label?: string
  targetLabel?: string
  presetId?: string
}

export type CampusMetrics = {
  activeStudents: number
  roomUtilization: number
  facultyLoad: number
  transportLoad: number
  campusStability: number
  affectedStudents: number
  conflicts: number
  recoveryHours: number
  personHoursDisrupted: number
  estimatedOperationalCost: number
  transportImpact: number
  energyImpact: number
  carbonImpact: number
  roomPressure: Severity
  transportPressure: Severity
}

export type Room = {
  id: string
  buildingId: string
  name: string
  capacity: number
  scheduledStudents: number
}

export type BuildingFootprint = {
  x: number
  y: number
  width: number
  height: number
  rotation?: number
}

export type Building = {
  id: string
  code: string
  name: string
  zone: string
  status: BuildingStatus
  capacity: number
  scheduledStudents: number
  roomCount: number
  facultyCount: number
  footprint: BuildingFootprint
  accent: "blue" | "green" | "amber" | "neutral"
  description: string
}

export type SimulationEvent = {
  id: string
  minuteOffset: number
  timeLabel: string
  title: string
  description: string
  nodeId: string
  severity: Severity
}

export type CampusSnapshot = {
  simulationTimeMinutes: number
  label: string
  metrics: CampusMetrics
  buildings: Building[]
  activeNodeIndex: number
}

export type CampusState = {
  simulationTimeMinutes: number
  buildings: Building[]
  rooms: Room[]
  metrics: CampusMetrics
  selectedBuildingId: string | null
  scenario: Scenario
  phase: SimulationPhase
  activeSnapshotIndex: number
  snapshots: CampusSnapshot[]
  events: SimulationEvent[]
  scenarioHistory: ScenarioHistory[]
  decisionSession: DecisionSession
}

export type ScenarioPreset = {
  id: string
  name: string
  category: ScenarioCategory
  target: string
  durationHours: number
  severity: number
  affectedSystems: AffectedSystem[]
  description: string
  scenario: Scenario
}

export type ScenarioHistory = {
  id: string
  scenario: Scenario
  completedAt: string
  stabilityBefore: number
  stabilityAfter: number
  affectedStudents: number
  recommendedIntervention: string
}

export type SimulationResult = {
  baseline: CampusSnapshot
  snapshots: CampusSnapshot[]
  events: SimulationEvent[]
  scenario: Scenario
}

export type DecisionCandidate = {
  id: "do-nothing" | "dynamic-reallocation" | "temporary-rooms" | "hybrid-intervention"
  label: string
  description: string
  mechanism?: string
  affectedStudents: number
  conflicts: number
  recoveryHours: number
  stability: number
  roomUtilization: number
  transportLoad: number
  primaryBenefit: string
  primaryTradeoff: string
  operationalCost: number
  operationalComplexity: "Low" | "Moderate" | "High"
  benefits: string[]
  tradeoffs: string[]
}

export type DecisionScore = {
  score: number
  subscores: {
    stability: number
    capacity: number
    mobility: number
    recovery: number
    conflict: number
  }
}

export type DecisionBranchStatus = "unexplored" | "selected" | "running" | "complete"

export type DecisionBranchResult = {
  score: number
  subscores: DecisionScore["subscores"]
  affectedStudents: number
  conflicts: number
  recoveryHours: number
  stability: number
  roomUtilization: number
  transportLoad: number
}

export type DecisionBranch = {
  id: string
  parentId: string
  candidateId: DecisionCandidate["id"]
  status: DecisionBranchStatus
  result?: DecisionBranchResult
}

export type DecisionSession = {
  branches: DecisionBranch[]
  activeBranchId: string | null
  selectedBranchIds: string[]
}
