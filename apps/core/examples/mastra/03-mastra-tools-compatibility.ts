/**
 * Mastra Tools Compatibility Example
 *
 * This example demonstrates PromptSmith's automatic compatibility with tools
 * created using Mastra's `createTool()` function. You can use tools from both
 * frameworks interchangeably without any manual conversion.
 *
 * Key concepts:
 * - Automatic detection of Mastra tool format
 * - Transparent conversion to PromptSmith format
 * - Mixing PromptSmith and Mastra tools
 * - Full type safety with overloads
 */

import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { createPromptBuilder } from "promptsmith-ts/builder";
import { z } from "zod";

// ========================================
// Example 1: Using Mastra tools directly
// ========================================

const weatherTool = createTool({
  id: "weatherTool",
  description: "Get current weather for a location",
  inputSchema: z.object({
    location: z.string(),
    units: z.enum(["celsius", "fahrenheit"]).default("celsius"),
  }),
  outputSchema: z.object({
    temperature: z.number(),
    conditions: z.string(),
  }),
  execute: async ({ context }) => {
    // Mock implementation
    return {
      temperature: context.units === "celsius" ? 22 : 72,
      conditions: "Partly cloudy",
    };
  },
});

// ✅ PromptSmith automatically detects and converts Mastra tools
const agent1 = createPromptBuilder()
  .withIdentity("Weather assistant")
  .withCapabilities(["Provide weather information"])
  .withTool(weatherTool) // ← Mastra tool works directly!
  .withTone("Friendly and informative");

// ========================================
// Example 2: Mixing PromptSmith and Mastra tools
// ========================================

// Mastra tool
const searchTool = createTool({
  id: "searchTool",
  description: "Search the knowledge base",
  inputSchema: z.object({ query: z.string() }),
  execute: async ({ context }) => {
    return `Search results for: ${context.query}`;
  },
});

// PromptSmith tool (traditional format)
const calculateTool = {
  name: "calculateTool",
  description: "Perform calculations",
  schema: z.object({
    expression: z.string(),
  }),
  execute: async ({ expression }: { expression: string }) => {
    // Mock calculation
    return { result: 42, expression };
  },
};

// ✅ Both formats work seamlessly together
const agent2 = createPromptBuilder()
  .withIdentity("Multi-purpose assistant")
  .withTool(searchTool) // ← Mastra format
  .withTool(calculateTool) // ← PromptSmith format
  .withConstraint("must", "Always verify calculations");

// ========================================
// Example 3: Export to different formats
// ========================================

// Create builder with mixed tools
const builder = createPromptBuilder()
  .withIdentity("Hybrid assistant")
  .withTool(weatherTool) // Mastra
  .withTool(calculateTool); // PromptSmith

// Export to AI SDK
const aiSdkConfig = builder.toAiSdk();
console.log("AI SDK tools:", Object.keys(aiSdkConfig.tools));
// Output: ['weatherTool', 'calculateTool']

// Export to Mastra
const mastraConfig = builder.toMastra();
console.log("Mastra tools:", Object.keys(mastraConfig.tools));
// Output: ['weatherTool', 'calculateTool']

// ========================================
// Example 4: Real-world usage with Mastra Agent
// ========================================

async function main() {
  const promptBuilder = createPromptBuilder()
    .withIdentity("Customer support assistant")
    .withCapabilities([
      "Answer product questions",
      "Help with orders",
      "Provide recommendations",
    ])
    .withTool(searchTool)
    .withTool(weatherTool)
    .withGuardrails()
    .withTone("Professional and helpful");

  const { instructions, tools } = promptBuilder.toMastra();

  const supportAgent = new Agent({
    name: "support-agent",
    instructions,
    model: "anthropic/claude-3-5-sonnet",
    tools, // All tools converted to Mastra format automatically
  });

  const response = await supportAgent.generate([
    {
      role: "user",
      content: "What's the weather in Tokyo and can you search for umbrellas?",
    },
  ]);

  console.log(response.text);
}

// ========================================
// Type Safety Benefits
// ========================================

// ✅ PromptSmith tools maintain full type inference
createPromptBuilder().withTool({
  name: "typedTool",
  description: "Fully typed",
  schema: z.object({
    input: z.string(),
    count: z.number(),
  }),
  execute: async ({ input, count }) => {
    // TypeScript knows: input is string, count is number
    return input.repeat(count);
  },
});

// ✅ Mastra tools are explicitly typed as MastraToolDefinition
createPromptBuilder().withTool(
  createTool({
    id: "mastraTyped",
    description: "Mastra tool",
    inputSchema: z.object({ value: z.string() }),
    execute: async ({ context }) => {
      // context is typed based on inputSchema
      return context.value;
    },
  })
);

main().catch(console.error);
