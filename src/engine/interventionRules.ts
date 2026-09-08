import { decisionCandidates } from "@/data/mockData"
import type { DecisionCandidate } from "@/types"

type OutcomeMetric = Pick<DecisionCandidate, "affectedStudents" | "conflicts" | "recoveryHours" | "stability" | "roomUtilization" | "transportLoad">
type OutcomeDelta = { [Key in keyof OutcomeMetric]: number }

export type InterventionRule = {
  mechanism: string
  deltas: OutcomeDelta
}

const zeroDelta: OutcomeDelta = {
  affectedStudents: 0,
  conflicts: 0,
  recoveryHours: 0,
  stability: 0,
  roomUtilization: 0,
  transportLoad: 0,
}

/**
 * These are deliberately small, transparent transformations of the closure
 * outcome. They are synthetic calibration rules, not forecasts.
 */
export const interventionRules: Record<DecisionCandidate["id"], InterventionRule> = {
  "do-nothing": {
    mechanism: "Allows the existing cascade to propagate without intervention.",
    deltas: zeroDelta,
  },
  "dynamic-reallocation": {
    mechanism: "Redistributes compatible classes before room pressure becomes critical.",
    deltas: {
      affectedStudents: -3640,
      conflicts: -33,
      recoveryHours: -5,
      stability: 46,
      roomUtilization: -16,
      transportLoad: -18,
    },
  },
  "temporary-rooms": {
    mechanism: "Adds short-term capacity to absorb displaced classes.",
    deltas: {
      affectedStudents: -2620,
      conflicts: -23,
      recoveryHours: -3,
      stability: 31,
      roomUtilization: -8,
      transportLoad: -8,
    },
  },
  "hybrid-intervention": {
    mechanism: "Combines upstream reassignment with short-term capacity for a wider response.",
    deltas: {
      affectedStudents: -4200,
      conflicts: -35,
      recoveryHours: -6,
      stability: 49,
      roomUtilization: 0,
      transportLoad: 2,
    },
  },
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value))
}

function applyMetricDelta(metric: keyof OutcomeMetric, value: number, delta: number) {
  if (metric === "stability") return clamp(value + delta, 0, 100)
  return Math.max(0, value + delta)
}

/** Resolve an intervention from the same Do Nothing closure outcome every time. */
export function deriveInterventionCandidate(candidate: DecisionCandidate, baseline = decisionCandidates[0]): DecisionCandidate {
  const rule = interventionRules[candidate.id]
  if (!rule) return candidate

  return {
    ...candidate,
    mechanism: rule.mechanism,
    ...Object.fromEntries(
      (Object.keys(rule.deltas) as (keyof OutcomeMetric)[]).map((metric) => [metric, applyMetricDelta(metric, baseline[metric], rule.deltas[metric])]),
    ),
  } as DecisionCandidate
}

/** Resolved candidates are the single source used by Decision and analysis views. */
export const derivedDecisionCandidates = decisionCandidates.map((candidate) => deriveInterventionCandidate(candidate))
