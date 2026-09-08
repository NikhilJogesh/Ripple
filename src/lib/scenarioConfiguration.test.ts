import { describe, expect, it } from "vitest"
import { scenarioPresets } from "@/data/mockData"
import { focusScenarioConfiguration } from "@/lib/scenarioConfiguration"

describe("Focus scenario configuration", () => {
  it("audits every existing preset kind with a coherent target and duration", () => {
    const configurations = scenarioPresets.map((preset) => focusScenarioConfiguration(preset.scenario))

    expect(configurations.map((configuration) => configuration.kind)).toEqual([
      "building-closure",
      "building-closure",
      "transport-capacity",
      "weather-event",
      "campus-event",
      "network-disruption",
    ])

    for (const preset of scenarioPresets) {
      const configuration = focusScenarioConfiguration(preset.scenario)
      expect(configuration.durationOptions).toContain(preset.durationHours)
      expect(preset.scenario.targetLabel).toBeTruthy()
    }
  })

  it("does not expose a building control for non-building scenarios", () => {
    const transport = focusScenarioConfiguration(scenarioPresets.find((preset) => preset.id === "transport-reduction")!.scenario)
    const weather = focusScenarioConfiguration(scenarioPresets.find((preset) => preset.id === "heavy-rain")!.scenario)

    expect(transport).toMatchObject({ heading: "TRANSPORT", targetFieldLabel: "Route", targetMode: "readout", sourceEventLabel: "Transport constraint", severityLabel: "Load / severity", severityMode: "exact" })
    expect(transport.durationOptions).toContain(5)
    expect(weather).toMatchObject({ heading: "WEATHER", targetFieldLabel: "Affected area", targetMode: "readout", sourceEventLabel: "Weather constraint", severityMode: "exact" })
    expect(weather.durationOptions).toContain(8)
  })

  it("keeps building closure configuration on the existing essential controls", () => {
    const closure = focusScenarioConfiguration(scenarioPresets[0].scenario)

    expect(closure).toMatchObject({ heading: "BUILDING CLOSURE", targetFieldLabel: "Building", targetMode: "building", sourceEventLabel: "Building offline", severityMode: "band", advancedExactSeverity: true })
    expect(closure.durationOptions).toEqual([2, 4, 6, 8, 12])
  })
})
