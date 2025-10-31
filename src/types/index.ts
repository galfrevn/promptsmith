import type { z } from "zod";

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
export interface ToolDefinition<T extends z.ZodType = z.ZodType> {
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
}

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
export interface Constraint {
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
}
