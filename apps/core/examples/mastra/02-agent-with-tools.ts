/**
 * Mastra Agent with Tools Example
 *
 * This example demonstrates the KEY BENEFIT of using PromptSmith with Mastra:
 * NO TOOL DUPLICATION. Define tools once in PromptSmith and they're
 * automatically converted to Mastra format with `.toMastra()`.
 *
 * Key concepts:
 * - Define tools once in PromptSmith
 * - Automatic tool conversion with `.toMastra()`
 * - Tool signature adaptation (params → context)
 */

import { Agent } from "@mastra/core/agent";
import { createPromptBuilder } from "promptsmith-ts/builder";
import { z } from "zod";

// Mock weather API
async function fetchWeather(location: string, units: string) {
  return {
    location,
    temperature: units === "celsius" ? "22°C" : "72°F",
    conditions: "Partly cloudy",
    humidity: "65%",
  };
}

async function main() {
  const promptBuilder = createPromptBuilder()
    .withIdentity("Weather information assistant")
    .withCapabilities(["Provide current weather conditions"])
    .withTool({
      name: "get-weather",
      description: "Get current weather for a location",
      schema: z.object({
        location: z.string(),
        units: z.enum(["celsius", "fahrenheit"]).default("celsius"),
      }),
      // ✅ Define execute once - automatically adapted for Mastra
      execute: async ({ location, units }) => {
        return await fetchWeather(location, units);
      },
    })
    .withConstraint("must", "Always use the weather tool for current conditions")
    .withTone("Friendly and informative");

  // ✅ Single method exports both instructions and tools
  const { instructions, tools } = promptBuilder.toMastra();

  const weatherAgent = new Agent({
    name: "weather-assistant",
    instructions,
    model: "anthropic/claude-3-5-sonnet",
    tools, // Already in Mastra format - no duplication!
  });

  const response = await weatherAgent.generate([
    { role: "user", content: "What's the weather in Tokyo?" },
  ]);

  console.log(response.text);
}

main().catch(console.error);
