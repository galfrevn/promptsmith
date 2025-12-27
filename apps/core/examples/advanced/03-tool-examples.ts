/**
 * Tool Examples Feature Demo
 *
 * This example demonstrates how to use tool examples to improve agent accuracy.
 * Research shows that tools with examples have 40-60% better usage accuracy.
 *
 * Key concepts:
 * - Adding examples to tool definitions
 * - Showing realistic scenarios with actual parameters
 * - Providing reasoning to guide model decisions
 */

import { createPromptBuilder } from "../../src/builder";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

async function main() {
  const agent = createPromptBuilder()
    .withIdentity("You are a helpful travel planning assistant")
    .withCapabilities([
      "Search for flights",
      "Get weather information",
      "Recommend destinations",
    ])
    .withTool({
      name: "search_flights",
      description: "Search for available flights between two locations",
      schema: z.object({
        origin: z.string().describe("Departure city or airport code"),
        destination: z.string().describe("Arrival city or airport code"),
        date: z.string().describe("Travel date in YYYY-MM-DD format"),
        passengers: z.number().optional().describe("Number of passengers"),
      }),
      // Examples significantly improve tool calling accuracy
      examples: [
        {
          scenario: "User asks 'Find me flights from NYC to Paris on June 15th'",
          parameters: {
            origin: "New York City",
            destination: "Paris",
            date: "2024-06-15",
            passengers: 1,
          },
          output: [
            {
              airline: "Air France",
              departure: "10:30",
              arrival: "23:45",
              price: 850,
            },
            {
              airline: "Delta",
              departure: "14:20",
              arrival: "03:35+1",
              price: 920,
            },
          ],
          reasoning:
            "Direct cities mentioned, specific date given, assume 1 passenger if not specified",
        },
        {
          scenario: "User asks 'I need to fly from LAX to Tokyo next Monday with my family of 4'",
          parameters: {
            origin: "LAX",
            destination: "Tokyo",
            date: "2024-01-08",
            passengers: 4,
          },
          output: [
            {
              airline: "Japan Airlines",
              departure: "11:00",
              arrival: "15:30+1",
              price: 3200,
            },
          ],
          reasoning:
            "Airport code provided, calculate 'next Monday' date, family of 4 means 4 passengers",
        },
      ],
    })
    .withTool({
      name: "get_weather",
      description: "Get current weather and forecast for a location",
      schema: z.object({
        location: z.string().describe("City name or coordinates"),
        units: z.enum(["celsius", "fahrenheit"]).optional(),
        days: z.number().optional().describe("Number of forecast days (1-7)"),
      }),
      examples: [
        {
          scenario: "User asks 'What's the weather in Tokyo?'",
          parameters: {
            location: "Tokyo",
            units: "celsius",
            days: 1,
          },
          output: {
            current: { temp: 22, condition: "Sunny", humidity: 60 },
            forecast: [],
          },
          reasoning: "Asian city, default to celsius, current weather only",
        },
        {
          scenario: "User asks 'Will it rain in San Francisco this week?'",
          parameters: {
            location: "San Francisco",
            units: "fahrenheit",
            days: 7,
          },
          output: {
            current: { temp: 65, condition: "Cloudy", humidity: 70 },
            forecast: [
              { day: "Mon", condition: "Rain", temp: 63 },
              { day: "Tue", condition: "Cloudy", temp: 64 },
              { day: "Wed", condition: "Rain", temp: 62 },
            ],
          },
          reasoning:
            "US city use fahrenheit, 'this week' means 7-day forecast",
        },
      ],
    })
    .withTone("Helpful, enthusiastic, and knowledgeable about travel");

  // Test the agent with various queries
  console.log("🧪 Testing agent with tool examples...\n");

  const testQueries = [
    "Find me flights from Boston to Barcelona on July 4th",
    "What's the weather like in Paris?",
    "I need to fly from SFO to London next Friday with 3 people",
  ];

  for (const query of testQueries) {
    console.log(`📝 Query: ${query}`);
    
    const { text } = await generateText({
      model: openai("gpt-4"),
      ...agent.toAiSdk(),
      prompt: query,
    });

    console.log(`🤖 Response: ${text}\n`);
  }

  // Show the generated prompt with examples
  console.log("\n📄 Generated Prompt Preview:");
  console.log("=".repeat(80));
  const prompt = agent.build();
  console.log(prompt.substring(0, 2000) + "...\n");

  // Compare with TOON format
  console.log("\n📦 TOON Format Preview (more compact):");
  console.log("=".repeat(80));
  const toonPrompt = agent.build("toon");
  console.log(toonPrompt.substring(0, 1500) + "...\n");
}

main().catch(console.error);
