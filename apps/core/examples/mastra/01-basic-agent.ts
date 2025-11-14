/**
 * Basic Mastra Agent Example
 *
 * This example demonstrates how to create a simple Mastra agent using
 * PromptSmith to generate instructions.
 *
 * Key concepts:
 * - Using `.toMastra()` to export configuration
 * - Creating a Mastra Agent
 * - Generating responses with Mastra
 */

import { Agent } from "@mastra/core/agent";
import { createPromptBuilder } from "promptsmith-ts/builder";

async function main() {
  const promptBuilder = createPromptBuilder()
    .withIdentity("You are a travel planning assistant")
    .withCapabilities([
      "Recommend destinations based on preferences",
      "Plan detailed itineraries",
      "Provide travel tips and advice",
    ])
    .withTone("Enthusiastic, knowledgeable, and helpful");

  // Export to Mastra format
  const { instructions, tools } = promptBuilder.toMastra();

  // Create Mastra agent
  const travelAgent = new Agent({
    name: "travel-planner",
    instructions,
    model: "openai/gpt-4o",
    tools,
  });

  // Generate response
  const response = await travelAgent.generate([
    {
      role: "user",
      content: "I want to visit Japan for 2 weeks. What should I see?",
    },
  ]);

  console.log(response.text);
}

main().catch(console.error);
