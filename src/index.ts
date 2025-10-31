/**
 * PromptSmith - A TypeScript library for building type-safe system prompts for AI agents.
 *
 * PromptSmith helps you construct structured, maintainable system prompts for AI agents
 * using a fluent builder API. It provides type safety through Zod schemas and generates
 * clean, well-organized markdown prompts that you can use with any AI model API.
 *
 * ## Key Features
 *
 * - **Type-Safe Tool Definitions**: Define tool parameters using Zod schemas with automatic
 *   validation and TypeScript type inference
 * - **Fluent Builder API**: Chain method calls to incrementally build complex prompts
 * - **Structured Output**: Generates organized markdown with clear sections for identity,
 *   capabilities, tools, constraints, and more
 * - **Separation of Concerns**: Keeps prompt generation (text for AI) separate from tool
 *   execution (runtime logic)
 * - **Zod Integration**: Leverages Zod for schema definition and automatic parameter
 *   documentation generation
 *
 * ## Quick Start
 *
 * ```typescript
 * import { createPromptBuilder } from "promptsmith";
 * import { z } from "zod";
 *
 * // Build a system prompt
 * const prompt = createPromptBuilder()
 *   .identity("You are a helpful travel assistant")
 *   .capabilities([
 *     "Search for destinations",
 *     "Provide weather information",
 *     "Suggest activities"
 *   ])
 *   .tool({
 *     name: "get_weather",
 *     description: "Get current weather for a location",
 *     schema: z.object({
 *       location: z.string().describe("City name"),
 *       units: z.enum(["celsius", "fahrenheit"]).optional()
 *     })
 *   })
 *   .constraint("must", "Always verify location exists before providing weather")
 *   .withTone("Be friendly and enthusiastic")
 *   .build();
 *
 * // Use with your AI API
 * const response = await yourAI.chat({
 *   system: prompt,
 *   messages: [{ role: "user", content: "What's the weather in Paris?" }]
 * });
 * ```
 *
 * ## Architecture
 *
 * PromptSmith follows a clear separation between prompt generation and tool execution:
 *
 * - **Prompt Generation** (this library): Defines what tools exist and how to use them.
 *   This information is sent to the AI model as text.
 * - **Tool Execution** (your application): Implements the actual tool logic that runs
 *   when the AI requests to use a tool.
 *
 * This separation ensures that your system prompts remain focused on describing
 * capabilities to the AI, while your application handles the implementation details.
 *
 * @packageDocumentation
 */

/**
 * Core builder class and factory
 */
export { SystemPromptBuilder, createPromptBuilder } from "@/core/builder";

/**
 * Type definitions
 */
export type { ToolDefinition, Constraint, ConstraintType } from "@/types";
