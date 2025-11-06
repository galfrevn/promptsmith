/**
 * Agent with Tools Example
 *
 * This example shows how to add tools to your agent and use them for
 * real-time data access.
 *
 * Key concepts:
 * - Defining tools with Zod schemas
 * - Adding execute functions for tool logic
 * - Tool parameter documentation
 * - Using constraints to guide tool usage
 */

import { createPromptBuilder } from "promptsmith-ts/builder";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

// Mock weather API
async function fetchWeather(location: string, units: string) {
  // In a real app, this would call an actual weather API
  return {
    location,
    temperature: units === "celsius" ? "22°C" : "72°F",
    conditions: "Partly cloudy",
    humidity: "65%",
  };
}

async function main() {
  const weatherAgent = createPromptBuilder()
    .withIdentity("You are a weather information assistant")
    .withCapabilities([
      "Provide current weather conditions",
      "Answer weather-related questions",
    ])
    .withTool({
      name: "get_weather",
      description: "Get current weather for a location",
      schema: z.object({
        location: z.string().describe("City name or coordinates"),
        units: z.enum(["celsius", "fahrenheit"]).default("celsius"),
      }),
      execute: async ({ location, units }) => {
        return await fetchWeather(location, units);
      },
    })
    .withConstraint("must", "Always use the weather tool for current conditions")
    .withConstraint("must_not", "Provide weather information without checking the tool")
    .withTone("Friendly and informative");

  const { text } = await generateText({
    model: openai("gpt-4"),
    ...weatherAgent.toAiSdk(),
    prompt: "What's the weather like in Tokyo?",
  });

  console.log(text);
}

main().catch(console.error);
