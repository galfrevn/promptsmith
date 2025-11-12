/**
 * Basic Agent Example
 *
 * This example demonstrates the fundamentals of creating a simple AI agent
 * using PromptSmith with the Vercel AI SDK.
 *
 * Key concepts:
 * - Creating a builder with `createPromptBuilder()`
 * - Setting identity and capabilities
 * - Using `.toAiSdk()` to export configuration
 * - Generating text with AI SDK
 */

import { createPromptBuilder } from "promptsmith-ts/builder";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

async function main() {
  // Create a basic travel assistant
  const agent = createPromptBuilder()
    .withIdentity("You are a helpful travel assistant")
    .withCapabilities([
      "Recommend destinations based on user preferences",
      "Plan detailed itineraries",
      "Provide travel tips and advice",
    ])
    .withTone("Enthusiastic, knowledgeable, and helpful");

  // Generate response
  const { text } = await generateText({
    model: openai("gpt-4"),
    ...agent.toAiSdk(), // Spreads { system, tools }
    prompt: "I want to visit Japan for 2 weeks. What should I see?",
  });

  console.log(text);
}

main().catch(console.error);
