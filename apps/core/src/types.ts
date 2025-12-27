import type { z } from "zod";

/**
 * Represents an example usage of a tool.
 *
 * Tool examples help the AI model understand when and how to use specific tools
 * by showing concrete scenarios with real parameter values. Research shows that
 * providing examples significantly improves tool calling accuracy and reduces errors.
 *
 * @example
 * ```typescript
 * {
 *   scenario: "User asks 'What's the weather in Paris?'",
 *   parameters: { location: "Paris", units: "celsius" },
 *   output: { temperature: 18, condition: "Partly cloudy", humidity: 65 },
 *   reasoning: "Direct location mentioned in query"
 * }
 * ```
 */
export type ToolExample = {
  /**
   * Description of the situation or user query that should trigger this tool.
   * Should be realistic and specific to help the model recognize similar patterns.
   *
   * @example "User asks for current temperature in a city"
   */
  scenario: string;

  /**
   * Example parameters that would be passed to the tool for this scenario.
   * Should be realistic values that match the tool's schema structure.
   *
   * @example { location: "Tokyo", units: "celsius" }
   */
  parameters: Record<string, unknown>;

  /**
   * Expected output or result from the tool for this scenario.
   * Shows the model what kind of data to expect back from the tool.
   *
   * @example { temperature: 22, condition: "Sunny", humidity: 45 }
   */
  output: unknown;

  /**
   * Optional explanation of why this tool is appropriate for this scenario.
   * Helps the model understand the reasoning behind tool selection.
   *
   * @example "Query explicitly mentions a location and asks about weather"
   */
  reasoning?: string;
};

/**
 * Defines a tool available to an AI agent.
 *
 * This interface represents the metadata needed to describe a tool in a system prompt.
 * It contains only the declarative information that an AI model needs to understand
 * when and how to use the tool - it does NOT include execution logic.
 *
 * The separation of tool definition from execution follows the principle that system
 * prompts are text sent to the model, while tool execution happens in your application
 * runtime when the model requests to use a tool.
 *
 * @template T - The Zod schema type that defines the tool's parameters
 *
 * @example
 * ```typescript
 * import { z } from "zod";
 *
 * const weatherTool: ToolDefinition = {
 *   name: "get_weather",
 *   description: "Retrieves current weather for a location. Use when user asks about weather conditions.",
 *   schema: z.object({
 *     location: z.string().describe("City name or address"),
 *     units: z.enum(["celsius", "fahrenheit"]).optional()
 *   })
 * };
 * ```
 */
export type ToolDefinition<T extends z.ZodType = z.ZodType> = {
  /**
   * Unique identifier for the tool.
   *
   * This name is used by the AI model to reference the tool when it decides to use it.
   * Should be descriptive, snake_case, and unique within your toolset.
   *
   * @example "get_weather", "search_database", "send_email"
   */
  name: string;

  /**
   * Human-readable description of what the tool does and when to use it.
   *
   * This description is shown to the AI model in the system prompt. It should clearly
   * explain the tool's purpose, what it returns, and any important usage guidelines.
   * Be specific about when the model should choose this tool over others.
   *
   * @example "Retrieves current weather data for a given location. Use this when the user asks about weather conditions, temperature, or forecasts."
   */
  description: string;

  /**
   * Zod schema defining the tool's input parameters.
   *
   * This schema serves dual purposes:
   * 1. Documents the parameters in the system prompt (via introspection)
   * 2. Can be used at runtime to validate tool invocation arguments
   *
   * Use `.describe()` on schema fields to provide parameter descriptions that will
   * appear in the generated system prompt.
   *
   * @example
   * ```typescript
   * z.object({
   *   query: z.string().describe("The search query text"),
   *   limit: z.number().optional().describe("Maximum results to return")
   * })
   * ```
   */
  schema: T;

  /**
   * Example usages of the tool to guide the AI model.
   *
   * Providing concrete examples of when and how to use the tool significantly
   * improves the model's ability to use it correctly. Each example should show
   * a realistic scenario with actual parameter values.
   *
   * Studies show that tools with examples have 40-60% better usage accuracy
   * compared to tools with only descriptions and schemas.
   *
   * @example
   * ```typescript
   * examples: [
   *   {
   *     scenario: "User asks 'What's the weather in Tokyo?'",
   *     parameters: { location: "Tokyo", units: "celsius" },
   *     output: { temp: 22, condition: "Sunny", humidity: 60 },
   *     reasoning: "Direct location mentioned, use celsius for Asian cities"
   *   },
   *   {
   *     scenario: "User asks 'Is it cold outside?'",
   *     parameters: { location: "user's current location", units: "celsius" },
   *     output: { temp: 8, condition: "Cloudy", humidity: 75 }
   *   }
   * ]
   * ```
   */
  examples?: ToolExample[];
};

/**
 * Extended tool definition that includes execution logic for AI SDK integration.
 *
 * This interface extends `ToolDefinition` to include an optional `execute` function
 * that implements the actual tool logic. When tools include execution logic, they can
 * be exported directly to Vercel AI SDK format using `.toAiSdkTools()` or `.toAiSdk()`.
 *
 * The separation remains flexible:
 * - Tools without `execute` are used for documentation only (system prompt)
 * - Tools with `execute` can be used for both documentation and runtime execution
 *
 * @template T - The Zod schema type that defines the tool's parameters
 *
 * @example
 * ```typescript
 * import { z } from "zod";
 *
 * const weatherTool: ExecutableToolDefinition = {
 *   name: "get_weather",
 *   description: "Get current weather for a location",
 *   schema: z.object({
 *     location: z.string().describe("City name")
 *   }),
 *   execute: async ({ location }) => {
 *     const response = await fetch(`https://api.weather.com/${location}`);
 *     return response.json();
 *   }
 * };
 * ```
 */
export interface ExecutableToolDefinition<T extends z.ZodType = z.ZodType>
  extends ToolDefinition<T> {
  /**
   * Execution function for the tool (optional).
   *
   * When provided, this function implements the actual tool logic. It receives
   * the validated arguments (matching the schema) and returns the tool's result.
   *
   * The function can be either synchronous or asynchronous (returning a Promise).
   *
   * @param args - The tool arguments, typed according to the schema
   * @returns The tool's result (any type), or a Promise resolving to the result
   *
   * @example
   * ```typescript
   * execute: async ({ query }) => {
   *   const results = await searchDatabase(query);
   *   return results;
   * }
   * ```
   */
  execute?: (args: z.infer<T>) => Promise<unknown> | unknown;
}

/**
 * Mastra-compatible tool definition.
 *
 * This interface represents a tool created with Mastra's `createTool()` function
 * from the `@mastra/core/tools` package. PromptSmith can automatically detect and
 * convert these tools to its internal format for seamless interoperability.
 *
 * Key differences from PromptSmith tools:
 * - Uses `id` instead of `name`
 * - Uses `inputSchema` instead of `schema`
 * - Has optional `outputSchema` for return type validation
 * - `execute` receives additional context parameters (runtimeContext, tracingContext, abortSignal)
 *
 * @see https://mastra.ai/docs/tools-mcp/overview
 *
 * @example
 * ```typescript
 * import { createTool } from "@mastra/core/tools";
 * import { z } from "zod";
 *
 * const weatherTool = createTool({
 *   id: "weather-tool",
 *   description: "Get weather for a location",
 *   inputSchema: z.object({ location: z.string() }),
 *   execute: async ({ context }) => {
 *     return await fetchWeather(context.location);
 *   }
 * });
 *
 * // Can be used directly with PromptSmith
 * builder.withTool(weatherTool); // Auto-detected and converted
 * ```
 */
export type MastraToolDefinition = {
  /**
   * Unique identifier for the tool (Mastra's equivalent of `name`)
   */
  id: string;

  /**
   * Human-readable description of what the tool does
   */
  description: string;

  /**
   * Zod schema defining the tool's input parameters (Mastra's equivalent of `schema`)
   */
  inputSchema: z.ZodType;

  /**
   * Optional Zod schema defining the tool's output structure
   */
  outputSchema?: z.ZodType;

  /**
   * Execution function for the tool.
   *
   * Receives an object with:
   * - `context`: The parsed input based on inputSchema
   * - `runtimeContext`: Runtime context for accessing shared state
   * - `tracingContext`: AI tracing context for observability
   * - `abortSignal`: Signal for aborting the tool execution
   */
  execute?: (args: {
    context: unknown;
    runtimeContext?: unknown;
    tracingContext?: unknown;
    abortSignal?: AbortSignal;
  }) => Promise<unknown> | unknown;
};

/**
 * Severity levels for behavioral constraints.
 *
 * These levels communicate different degrees of requirement to the AI model:
 * - `must`: Absolute requirements that cannot be violated
 * - `must_not`: Absolute prohibitions that cannot be violated
 * - `should`: Strong recommendations that should be followed when possible
 * - `should_not`: Strong recommendations to avoid, but not absolute prohibitions
 *
 * The levels follow RFC 2119 conventions for requirement keywords, providing
 * clear hierarchy for the model to understand priority of different guidelines.
 */
export type ConstraintType = "must" | "must_not" | "should" | "should_not";

/**
 * Output format for the generated prompt.
 *
 * - `markdown`: Standard markdown format (default, human-readable with headers and formatting)
 * - `toon`: TOON format (Token-Oriented Object Notation) - optimized format that reduces tokens by 30-60%
 * - `compact`: Minimal whitespace variant of markdown, optimized for token usage
 *
 * @example
 * ```typescript
 * builder.withFormat('toon'); // Use TOON format for token optimization
 * builder.withFormat('markdown'); // Use standard markdown (default)
 * ```
 */
export type PromptFormat = "markdown" | "toon" | "compact";

/**
 * A behavioral constraint or guideline for the AI agent.
 *
 * Constraints define rules that govern the agent's behavior. They are organized
 * by severity level (must, must_not, should, should_not) in the generated prompt
 * to communicate priority and flexibility to the model.
 *
 * Use constraints to:
 * - Enforce security and privacy requirements (must/must_not)
 * - Define quality standards (should)
 * - Specify tone and interaction patterns
 * - Set boundaries on agent capabilities
 *
 * @example
 * ```typescript
 * // Security requirement
 * { type: "must", rule: "Always verify user authentication before accessing personal data" }
 *
 * // Prohibition
 * { type: "must_not", rule: "Never store or log sensitive user information" }
 *
 * // Recommendation
 * { type: "should", rule: "Provide concise responses when user seems in a hurry" }
 * ```
 */
export type Constraint = {
  /**
   * The severity level of this constraint.
   *
   * Determines how this constraint is grouped and presented in the system prompt.
   * Higher severity (must/must_not) indicates non-negotiable requirements, while
   * lower severity (should/should_not) indicates preferences and recommendations.
   */
  type: ConstraintType;

  /**
   * The actual constraint rule text.
   *
   * Should be written as a clear, actionable guideline. Use imperative mood
   * and be specific about the expected behavior. Avoid ambiguous language.
   *
   * @example "Cite sources for all factual claims", "Avoid technical jargon when explaining to beginners"
   */
  rule: string;
};

/**
 * Represents a single example for few-shot learning in the system prompt.
 *
 * Examples demonstrate desired behavior to the AI model through concrete
 * input-output pairs. This is one of the most effective techniques for
 * guiding model behavior and ensuring consistency.
 *
 * You can use either `user`/`assistant` (conversational style) or
 * `input`/`output` (function-call style) - they are equivalent. The optional
 * `explanation` field can provide additional context about why this example
 * demonstrates good behavior.
 *
 * @example
 * ```typescript
 * // Conversational style
 * {
 *   user: "What's the weather in Paris?",
 *   assistant: "I'll check the weather for you. Let me use the get_weather tool.",
 *   explanation: "Shows proper tool usage for weather queries"
 * }
 *
 * // Function-call style
 * {
 *   input: "Schedule appointment for tomorrow at 3pm",
 *   output: "Let me check availability for tomorrow at 3 PM."
 * }
 * ```
 */
export type Example = {
  /**
   * User's input message (conversational style).
   * Use this OR `input`, not both.
   */
  user?: string;

  /**
   * Agent's response (conversational style).
   * Use this OR `output`, not both.
   */
  assistant?: string;

  /**
   * Input to the agent (function-call style).
   * Use this OR `user`, not both.
   */
  input?: string;

  /**
   * Agent's output (function-call style).
   * Use this OR `assistant`, not both.
   */
  output?: string;

  /**
   * Optional explanation of what this example demonstrates.
   * Helps clarify the reasoning behind the example.
   */
  explanation?: string;
};

/**
 * Configuration object returned by `.toAiSdk()` for Vercel AI SDK integration.
 *
 * This interface defines the structure of the object returned by the `toAiSdk()`
 * method, which includes both the system prompt and tools formatted for use with
 * Vercel's AI SDK.
 *
 * The object can be spread directly into `generateText`, `streamText`, or other
 * AI SDK function calls for seamless integration.
 *
 * @example
 * ```typescript
 * import { generateText } from 'ai';
 * import { openai } from '@ai-sdk/openai';
 *
 * const config = builder.toAiSdk();
 *
 * const response = await generateText({
 *   model: openai('gpt-4'),
 *   ...config,
 *   prompt: "What's the weather in Paris?"
 * });
 * ```
 */
export type AiSdkConfig = {
  /**
   * The system prompt string generated by the builder.
   *
   * This is the same string returned by `.build()`, containing the complete
   * markdown-formatted system prompt with identity, capabilities, tools
   * documentation, constraints, and formatting guidelines.
   */
  system: string;

  /**
   * Tools in Vercel AI SDK format.
   *
   * A record mapping tool names to their AI SDK-compatible definitions,
   * including description, parameters (Zod schema), and optional execute function.
   *
   * Tools without an `execute` function will have `execute` set to `undefined`,
   * allowing for documentation-only tools or client-side tool handling.
   */
  tools: Record<
    string,
    {
      description: string;
      parameters: z.ZodType;
      execute?: (args: unknown) => Promise<unknown> | unknown;
    }
  >;
};

/**
 * Represents a single test case for prompt evaluation.
 *
 * A test case defines a scenario where you want to verify that the prompt
 * causes the AI to behave in a specific way. The system will run the query
 * through the prompt and evaluate if the response meets the expected behavior.
 *
 * @example
 * ```typescript
 * {
 *   query: "Hello!",
 *   expectedBehavior: "Respond with a friendly greeting and offer to help",
 *   context: "Testing initial user interaction"
 * }
 * ```
 */
export type TestCase = {
  /**
   * The user input to test.
   *
   * This is the message or query that will be sent to the AI model
   * using your system prompt.
   */
  query: string;

  /**
   * Description of how the AI should respond.
   *
   * This is NOT the exact text you expect, but rather a description of
   * the desired behavior. The judge LLM will evaluate if the actual response
   * meets this expectation.
   *
   * @example "Politely decline and suggest alternative topics within scope"
   */
  expectedBehavior: string;

  /**
   * Optional context about this test case.
   *
   * Provides additional information about what this test is verifying
   * or why it's important. Useful for documentation and debugging.
   */
  context?: string;
};

/**
 * Options for configuring the test execution.
 */
export type TestOptions = {
  /**
   * Temperature setting for generating responses (0-1).
   *
   * Lower values (0.1-0.3) make responses more deterministic and consistent.
   * Higher values (0.7-1.0) make responses more creative and varied.
   *
   * @default 0.7
   */
  temperature?: number;

  /**
   * Optional separate model to use for judging responses.
   *
   * If not provided, uses the same model as the provider.
   * You might want to use a more capable model for judging (e.g., GPT-4)
   * even if you're testing a simpler model's responses.
   */
  judgeModel?: Parameters<typeof import("ai").generateText>[0]["model"];
};

/**
 * Result of evaluating a single test case.
 */
export type TestCaseResult = {
  /**
   * The original test case that was evaluated.
   */
  testCase: TestCase;

  /**
   * Whether the test passed or failed.
   */
  result: "pass" | "fail";

  /**
   * The actual response generated by the AI using the prompt.
   */
  actualResponse: string;

  /**
   * The judge's evaluation and reasoning.
   *
   * Explains why the response was considered a pass or fail,
   * and provides specific feedback about what was good or problematic.
   */
  evaluation: string;

  /**
   * Numeric score for this test case (0-100).
   */
  score: number;
};

/**
 * Complete results from testing a prompt with multiple test cases.
 */
export type TestResult = {
  /**
   * Overall score across all test cases (0-100).
   *
   * This is calculated as the average of individual test case scores.
   */
  overallScore: number;

  /**
   * Number of test cases that passed.
   */
  passed: number;

  /**
   * Number of test cases that failed.
   */
  failed: number;

  /**
   * Detailed results for each test case.
   */
  cases: TestCaseResult[];

  /**
   * Actionable suggestions for improving the prompt.
   *
   * Based on the failed test cases, provides specific recommendations
   * for how to modify the prompt to achieve better results.
   */
  suggestions: string[];
};
