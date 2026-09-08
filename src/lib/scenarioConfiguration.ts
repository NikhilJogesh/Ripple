import type { Scenario, ScenarioKind } from "@/types"

export type FocusScenarioConfiguration = {
  kind: ScenarioKind | "fallback"
  heading: string
  targetFieldLabel: string
  targetMode: "building" | "readout"
  sourceEventLabel: string
  sourceAction: string
  severityLabel: string
  severityMode: "band" | "exact"
  advancedExactSeverity: boolean
  durationOptions: number[]
}

const defaultDurationOptions = [2, 4, 6, 8, 12]

const scenarioConfigurationByKind: Record<ScenarioKind, Omit<FocusScenarioConfiguration, "kind" | "durationOptions">> = {
  "building-closure": {
    heading: "BUILDING CLOSURE",
    targetFieldLabel: "Building",
    targetMode: "building",
    sourceEventLabel: "Building offline",
    sourceAction: "closes",
    severityLabel: "Severity",
    severityMode: "band",
    advancedExactSeverity: true,
  },
  "transport-capacity": {
    heading: "TRANSPORT",
    targetFieldLabel: "Route",
    targetMode: "readout",
    sourceEventLabel: "Transport constraint",
    sourceAction: "capacity constrained",
    severityLabel: "Load / severity",
    severityMode: "exact",
    advancedExactSeverity: false,
  },
  "weather-event": {
    heading: "WEATHER",
    targetFieldLabel: "Affected area",
    targetMode: "readout",
    sourceEventLabel: "Weather constraint",
    sourceAction: "is affected",
    severityLabel: "Severity",
    severityMode: "exact",
    advancedExactSeverity: false,
  },
  "campus-event": {
    heading: "OPERATIONS",
    targetFieldLabel: "Event area",
    targetMode: "readout",
    sourceEventLabel: "Campus event active",
    sourceAction: "demand increases",
    severityLabel: "Severity",
    severityMode: "exact",
    advancedExactSeverity: false,
  },
  "network-disruption": {
    heading: "CAPACITY",
    targetFieldLabel: "Affected system",
    targetMode: "readout",
    sourceEventLabel: "Network constraint",
    sourceAction: "is disrupted",
    severityLabel: "Severity",
    severityMode: "exact",
    advancedExactSeverity: false,
  },
}

function durationOptionsFor(scenario: Scenario) {
  return [...new Set([...defaultDurationOptions, scenario.durationHours])].sort((a, b) => a - b)
}

export function focusScenarioConfiguration(scenario: Scenario): FocusScenarioConfiguration {
  const configuration = scenario.kind ? scenarioConfigurationByKind[scenario.kind] : undefined

  return {
    kind: scenario.kind ?? "fallback",
    heading: configuration?.heading ?? scenario.category ?? "SCENARIO",
    targetFieldLabel: configuration?.targetFieldLabel ?? "Target",
    targetMode: configuration?.targetMode ?? "readout",
    sourceEventLabel: configuration?.sourceEventLabel ?? "Scenario constraint",
    sourceAction: configuration?.sourceAction ?? "is active",
    severityLabel: configuration?.severityLabel ?? "Severity",
    severityMode: configuration?.severityMode ?? "exact",
    advancedExactSeverity: configuration?.advancedExactSeverity ?? false,
    durationOptions: durationOptionsFor(scenario),
  }
}
