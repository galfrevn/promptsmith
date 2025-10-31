import type {
	AiSdkConfig,
	Constraint,
	ConstraintType,
	ExecutableToolDefinition,
	ToolDefinition,
} from "@/types";
import { parseZodSchema } from "@/utils/schemas";

/**
 * Builder class for constructing type-safe system prompts for AI agents.
 *
 * `SystemPromptBuilder` implements a fluent API pattern that allows you to
 * incrementally build a comprehensive system prompt by chaining method calls.
 * The builder collects configuration for agent identity, capabilities, available
 * tools, behavioral constraints, communication style, and output formatting.
 *
 * When you call `.build()`, it generates a structured markdown document that
 * serves as the system prompt for your AI agent. The generated prompt only
 * includes sections for which you've provided content, keeping it clean and
 * focused.
 *
 * #### Design Philosophy
 *
 * This builder separates prompt generation (text for the AI model) from tool
 * execution (runtime logic). Tools are registered with metadata only - the
 * actual execution happens in your application when the AI requests to use a tool.
 *
 * ##### Usage Pattern
 *
 * 1. Create a builder instance (typically via `createPromptBuilder()`)
 * 2. Chain method calls to configure the agent
 * 3. Call `.build()` to generate the system prompt string
 * 4. Use the prompt with your AI model API
 *
 * @example
 * ```typescript
 * import { createPromptBuilder } from "promptsmith";
 * import { z } from "zod";
 *
 * const prompt = createPromptBuilder()
 *   .identity("You are a helpful coding assistant")
 *   .capabilities([
 *     "Explain code concepts",
 *     "Write code examples",
 *     "Debug issues"
 *   ])
 *   .tool({
 *     name: "search_docs",
 *     description: "Search technical documentation",
 *     schema: z.object({
 *       query: z.string().describe("Search query")
 *     })
 *   })
 *   .constraint("must", "Always provide working code examples")
 *   .withTone("Be patient and encouraging")
 *   .build();
 * ```
 */
export class SystemPromptBuilder {
	private _identity = "";
	private _capabilities: string[] = [];
	private _tools: ToolDefinition[] = [];
	private _constraints: Constraint[] = [];
	private _outputFormat = "";
	private _tone = "";

	/**
	 * Sets the agent's core identity or purpose.
	 *
	 * The identity defines who or what the agent is. This should be a clear,
	 * concise statement that establishes the agent's role, expertise, and primary
	 * function. This appears first in the generated prompt and frames all subsequent
	 * instructions.
	 *
	 * @param text - A description of the agent's identity. Should be written in
	 *   second person ("You are...") or third person ("The assistant is...").
	 *   Keep it focused and specific to guide the model's behavior.
	 *
	 * @returns The builder instance for method chaining
	 *
	 * @example
	 * ```typescript
	 * builder.identity("You are an expert travel assistant specializing in European destinations");
	 *
	 * builder.identity("You are a senior software engineer with 10 years of experience in distributed systems");
	 * ```
	 */
	identity(text: string): this {
		this._identity = text;
		return this;
	}

	/**
	 * Adds a single capability to the agent's skillset.
	 *
	 * Capabilities define what the agent can do. Each capability should describe
	 * a specific skill, action, or area of expertise. Multiple calls to this method
	 * will accumulate capabilities - they don't replace previous ones.
	 *
	 * @param cap - A single capability description. Should be action-oriented and
	 *   specific enough to be meaningful but broad enough to be useful.
	 *
	 * @returns The builder instance for method chaining
	 *
	 * @example
	 * ```typescript
	 * builder
	 *   .capability("Search and analyze research papers")
	 *   .capability("Generate literature reviews")
	 *   .capability("Explain complex scientific concepts");
	 * ```
	 */
	capability(cap: string): this {
		if (cap) {
			this._capabilities.push(cap);
		}
		return this;
	}

	/**
	 * Adds multiple capabilities at once to the agent's skillset.
	 *
	 * This is a convenience method for adding several capabilities in a single
	 * call, equivalent to calling `.capability()` multiple times. Empty strings
	 * in the array are filtered out automatically.
	 *
	 * @param caps - An array of capability descriptions. Each should describe a
	 *   specific skill or action the agent can perform.
	 *
	 * @returns The builder instance for method chaining
	 *
	 * @example
	 * ```typescript
	 * builder.capabilities([
	 *   "Analyze financial data and trends",
	 *   "Calculate investment returns",
	 *   "Provide risk assessments",
	 *   "Generate financial reports"
	 * ]);
	 * ```
	 */
	capabilities(caps: string[]): this {
		this._capabilities.push(...caps.filter((c) => c));
		return this;
	}

	/**
	 * Registers a tool that the agent can use.
	 *
	 * Tools are external functions or APIs that the agent can invoke to perform
	 * actions or retrieve information. This method only registers the tool's
	 * metadata (name, description, parameters) - not the execution logic.
	 *
	 * The tool definition is used to generate documentation in the system prompt
	 * that explains to the AI model when and how to use the tool. The Zod schema
	 * is introspected to create human-readable parameter documentation.
	 *
	 * @template T - The Zod schema type for the tool's parameters
	 * @param def - Tool definition containing name, description, and parameter schema
	 *
	 * @returns The builder instance for method chaining
	 *
	 * @example
	 * ```typescript
	 * builder.tool({
	 *   name: "get_weather",
	 *   description: "Retrieves current weather for a location. Use when user asks about weather.",
	 *   schema: z.object({
	 *     location: z.string().describe("City name or ZIP code"),
	 *     units: z.enum(["celsius", "fahrenheit"]).optional().describe("Temperature units")
	 *   })
	 * });
	 * ```
	 */
	tool<T extends import("zod").ZodType>(def: ToolDefinition<T>): this {
		this._tools.push(def);
		return this;
	}

	/**
	 * Registers multiple tools at once.
	 *
	 * This is a convenience method for adding several tools in a single call,
	 * equivalent to calling `.tool()` multiple times. Useful when you have a
	 * pre-defined collection of tools to register.
	 *
	 * @param defs - An array of tool definitions
	 *
	 * @returns The builder instance for method chaining
	 *
	 * @example
	 * ```typescript
	 * const myTools = [
	 *   { name: "tool1", description: "First tool", schema: z.object({...}) },
	 *   { name: "tool2", description: "Second tool", schema: z.object({...}) }
	 * ];
	 *
	 * builder.tools(myTools);
	 * ```
	 */
	tools(defs: ToolDefinition[]): this {
		this._tools.push(...defs);
		return this;
	}

	/**
	 * Adds a behavioral constraint or guideline for the agent.
	 *
	 * Constraints define rules that govern the agent's behavior with different
	 * levels of severity. They are organized by type in the generated prompt to
	 * communicate priority to the model:
	 *
	 * - `must`: Absolute requirements that cannot be violated
	 * - `must_not`: Absolute prohibitions
	 * - `should`: Strong recommendations to follow when possible
	 * - `should_not`: Strong recommendations to avoid
	 *
	 * Use constraints to enforce security, privacy, quality standards, tone,
	 * and interaction patterns.
	 *
	 * @param type - The constraint severity level
	 * @param rule - The constraint rule text. Should be clear, specific, and
	 *   actionable. Use imperative mood ("Do X", "Never Y").
	 *
	 * @returns The builder instance for method chaining
	 *
	 * @example
	 * ```typescript
	 * builder
	 *   .constraint("must", "Always verify user authentication before accessing personal data")
	 *   .constraint("must_not", "Never store or log sensitive information")
	 *   .constraint("should", "Provide concise responses unless detail is requested")
	 *   .constraint("should_not", "Avoid using technical jargon with non-technical users");
	 * ```
	 */
	constraint(type: ConstraintType, rule: string): this {
		if (rule) {
			this._constraints.push({ type, rule });
		}
		return this;
	}

	/**
	 * Sets the output format guidelines for the agent's responses.
	 *
	 * The output format defines how the agent should structure its responses.
	 * This can specify formatting patterns, response structure, markdown usage,
	 * or any other output conventions the agent should follow.
	 *
	 * Supports multi-line strings for complex formatting instructions.
	 *
	 * @param format - Output format description or template. Can include examples,
	 *   numbered steps, markdown formatting requirements, or structural guidelines.
	 *
	 * @returns The builder instance for method chaining
	 *
	 * @example
	 * ```typescript
	 * builder.output("Respond in this format:\n1. Summary\n2. Details\n3. Next steps");
	 *
	 * builder.output(`
	 *   Use the following structure:
	 *   - Brief overview (2-3 sentences)
	 *   - Bullet points for key information
	 *   - Code examples when relevant
	 *   - Concluding recommendation
	 * `);
	 * ```
	 */
	output(format: string): this {
		this._outputFormat = format;
		return this;
	}

	/**
	 * Sets the communication tone and style for the agent.
	 *
	 * The tone defines how the agent should communicate - its personality,
	 * formality level, and interaction style. This helps ensure consistent
	 * and appropriate communication for your use case.
	 *
	 * @param tone - Description of the desired communication style. Should specify
	 *   personality traits, formality level, and interaction patterns. Can include
	 *   multiple aspects (e.g., "friendly but professional").
	 *
	 * @returns The builder instance for method chaining
	 *
	 * @example
	 * ```typescript
	 * builder.withTone("Be friendly, enthusiastic, and encouraging. Use a conversational tone.");
	 *
	 * builder.withTone("Maintain a professional and formal tone. Be precise and avoid casual language.");
	 *
	 * builder.withTone("Be patient and educational. Explain concepts clearly without being condescending.");
	 * ```
	 */
	withTone(tone: string): this {
		this._tone = tone;
		return this;
	}

	/**
	 * Returns the list of registered tools.
	 *
	 * This method provides access to the tool definitions that have been registered
	 * with the builder. Useful for introspection, validation, or passing tools to
	 * other systems.
	 *
	 * @returns An array of tool definitions (without execution logic)
	 *
	 * @example
	 * ```typescript
	 * const builder = createPromptBuilder()
	 *   .tool({ name: "tool1", description: "...", schema: z.object({}) })
	 *   .tool({ name: "tool2", description: "...", schema: z.object({}) });
	 *
	 * const tools = builder.getTools();
	 * console.log(tools.length); // 2
	 * console.log(tools[0].name); // "tool1"
	 * ```
	 */
	getTools(): ToolDefinition[] {
		return this._tools;
	}

	/**
	 * Exports tools in Vercel AI SDK format.
	 *
	 * This method converts PromptSmith tool definitions into the format expected
	 * by Vercel's AI SDK. Each tool is transformed into an object with `description`,
	 * `parameters` (the Zod schema), and an optional `execute` function.
	 *
	 * Tools that don't have an `execute` function will still be included, but with
	 * `execute` set to `undefined`. This allows for:
	 * - Documentation-only tools (appear in system prompt but not executable)
	 * - Client-side tool handling (execution happens in the client)
	 * - Mixed tool sets (some executable, some not)
	 *
	 * The returned object can be passed directly to AI SDK functions like
	 * `generateText` or `streamText`.
	 *
	 * @returns A record mapping tool names to AI SDK-compatible tool definitions
	 *
	 * @example
	 * ```typescript
	 * import { generateText } from 'ai';
	 * import { openai } from '@ai-sdk/openai';
	 * import { createPromptBuilder } from 'promptsmith';
	 * import { z } from 'zod';
	 *
	 * const builder = createPromptBuilder()
	 *   .identity("You are a helpful weather assistant")
	 *   .tool({
	 *     name: "get_weather",
	 *     description: "Get current weather for a location",
	 *     schema: z.object({
	 *       location: z.string().describe("City name")
	 *     }),
	 *     execute: async ({ location }) => {
	 *       const response = await fetch(`https://api.weather.com/${location}`);
	 *       return response.json();
	 *     }
	 *   })
	 *   .tool({
	 *     name: "get_forecast",
	 *     description: "Get 5-day forecast",
	 *     schema: z.object({
	 *       location: z.string().describe("City name")
	 *     }),
	 *     execute: async ({ location }) => {
	 *       const response = await fetch(`https://api.weather.com/${location}/forecast`);
	 *       return response.json();
	 *     }
	 *   });
	 *
	 * const response = await generateText({
	 *   model: openai('gpt-4'),
	 *   system: builder.build(),
	 *   tools: builder.toAiSdkTools(),
	 *   prompt: "What's the weather in Paris?"
	 * });
	 * ```
	 */
	toAiSdkTools(): Record<
		string,
		{
			description: string;
			parameters: import("zod").ZodType;
			execute?: (args: unknown) => Promise<unknown> | unknown;
		}
	> {
		const aiTools: Record<
			string,
			{
				description: string;
				parameters: import("zod").ZodType;
				execute?: (args: unknown) => Promise<unknown> | unknown;
			}
		> = {};

		for (const tool of this._tools) {
			const executableTool = tool as ExecutableToolDefinition;
			aiTools[tool.name] = {
				description: tool.description,
				parameters: tool.schema,
				execute: executableTool.execute,
			};
		}

		return aiTools;
	}

	/**
	 * Exports a complete AI SDK configuration object.
	 *
	 * This is a convenience method that returns both the system prompt and tools
	 * in a single object, ready to spread into Vercel AI SDK function calls.
	 *
	 * The returned object contains:
	 * - `system`: The complete system prompt (same as calling `.build()`)
	 * - `tools`: Tools in AI SDK format (same as calling `.toAiSdkTools()`)
	 *
	 * This method is particularly useful when using the spread operator, allowing
	 * you to define your agent configuration once and use it seamlessly with the
	 * AI SDK.
	 *
	 * @returns An object with `system` and `tools` properties ready for AI SDK
	 *
	 * @example
	 * ```typescript
	 * import { generateText } from 'ai';
	 * import { openai } from '@ai-sdk/openai';
	 * import { createPromptBuilder } from 'promptsmith';
	 * import { z } from 'zod';
	 *
	 * const builder = createPromptBuilder()
	 *   .identity("You are a helpful weather assistant")
	 *   .capabilities(["Provide weather information", "Give forecasts"])
	 *   .tool({
	 *     name: "get_weather",
	 *     description: "Get current weather for a location",
	 *     schema: z.object({
	 *       location: z.string().describe("City name")
	 *     }),
	 *     execute: async ({ location }) => {
	 *       const response = await fetch(`https://api.weather.com/${location}`);
	 *       return response.json();
	 *     }
	 *   })
	 *   .constraint("must", "Always verify location exists before providing weather")
	 *   .withTone("Be friendly and helpful");
	 *
	 * // Ultra clean usage with spread operator
	 * const response = await generateText({
	 *   model: openai('gpt-4'),
	 *   ...builder.toAiSdk(),
	 *   prompt: "What's the weather in Paris?",
	 *   maxSteps: 5
	 * });
	 *
	 * // Or destructured if you prefer
	 * const { system, tools } = builder.toAiSdk();
	 * const response2 = await generateText({
	 *   model: openai('gpt-4'),
	 *   system,
	 *   tools,
	 *   prompt: "What's the weather?"
	 * });
	 * ```
	 */
	toAiSdk(): AiSdkConfig {
		return {
			system: this.build(),
			tools: this.toAiSdkTools(),
		};
	}

	/**
	 * Exports the builder's configuration as a plain JavaScript object.
	 *
	 * This method serializes the entire builder state into a JSON-compatible
	 * object. Useful for saving configurations, debugging, or transmitting
	 * the configuration to other systems.
	 *
	 * Note: Zod schemas in tool definitions may not serialize perfectly to JSON
	 * due to their internal structure.
	 *
	 * @returns An object containing all builder configuration
	 *
	 * @example
	 * ```typescript
	 * const config = builder.toJSON();
	 *
	 * // Save to file
	 * fs.writeFileSync('agent-config.json', JSON.stringify(config, null, 2));
	 *
	 * // Inspect configuration
	 * console.log(config.identity);
	 * console.log(config.capabilities);
	 * ```
	 */
	toJSON(): object {
		return {
			identity: this._identity,
			capabilities: this._capabilities,
			tools: this._tools,
			constraints: this._constraints,
			outputFormat: this._outputFormat,
			tone: this._tone,
		};
	}

	/**
	 * Builds and returns the complete system prompt as a markdown string.
	 *
	 * This is the primary output method of the builder. It generates a structured
	 * markdown document containing all the configuration you've provided, formatted
	 * as a system prompt ready to send to an AI model.
	 *
	 * The generated prompt includes sections for:
	 * - Identity (who/what the agent is)
	 * - Capabilities (what it can do)
	 * - Available Tools (with parameter documentation)
	 * - Behavioral Guidelines (constraints organized by severity)
	 * - Communication Style (tone)
	 * - Output Format (response structure)
	 *
	 * Only sections with content are included - empty sections are omitted to keep
	 * the prompt clean and focused.
	 *
	 * Constraints are automatically grouped by type and presented in order of
	 * severity (must, must_not, should, should_not).
	 *
	 * @returns A markdown-formatted system prompt string ready for use with AI models
	 *
	 * @example
	 * ```typescript
	 * const prompt = createPromptBuilder()
	 *   .identity("You are a helpful assistant")
	 *   .capability("Answer questions")
	 *   .build();
	 *
	 * console.log(prompt);
	 * // # Identity
	 * // You are a helpful assistant
	 * //
	 * // # Capabilities
	 * // 1. Answer questions
	 *
	 * // Use with an AI API
	 * const response = await openai.chat.completions.create({
	 *   messages: [
	 *     { role: "system", content: prompt },
	 *     { role: "user", content: "Hello!" }
	 *   ]
	 * });
	 * ```
	 */
	build(): string {
		const sections: string[] = [];

		/**
		 * Identity section
		 */
		if (this._identity) {
			sections.push("# Identity\n");
			sections.push(`${this._identity}\n`);
		}

		/**
		 * Capabilities section
		 */
		if (this._capabilities.length > 0) {
			sections.push("# Capabilities\n");
			for (const [index, cap] of this._capabilities.entries()) {
				sections.push(`${index + 1}. ${cap}\n`);
			}
		}

		/**
		 * Tools section
		 */
		if (this._tools.length > 0) {
			sections.push("# Available Tools\n");
			for (const tool of this._tools) {
				sections.push(`## ${tool.name}\n`);
				sections.push(`${tool.description}\n\n`);
				sections.push("**Parameters:**\n");
				sections.push(`${parseZodSchema(tool.schema)}\n`);
			}
		}

		/**
		 * Behavioral Guidelines section
		 */
		const constraintsByType = {
			must: this._constraints.filter((c) => c.type === "must"),
			must_not: this._constraints.filter((c) => c.type === "must_not"),
			should: this._constraints.filter((c) => c.type === "should"),
			should_not: this._constraints.filter((c) => c.type === "should_not"),
		};

		const hasConstraints = this._constraints.length > 0;
		if (hasConstraints) {
			sections.push("# Behavioral Guidelines\n");

			if (constraintsByType.must.length > 0) {
				sections.push("## You MUST:\n");
				for (const constraint of constraintsByType.must) {
					sections.push(`- ${constraint.rule}\n`);
				}
				sections.push("\n");
			}

			if (constraintsByType.must_not.length > 0) {
				sections.push("## You MUST NOT:\n");
				for (const constraint of constraintsByType.must_not) {
					sections.push(`- ${constraint.rule}\n`);
				}
				sections.push("\n");
			}

			if (constraintsByType.should.length > 0) {
				sections.push("## You SHOULD:\n");
				for (const constraint of constraintsByType.should) {
					sections.push(`- ${constraint.rule}\n`);
				}
				sections.push("\n");
			}

			if (constraintsByType.should_not.length > 0) {
				sections.push("## You SHOULD NOT:\n");
				for (const constraint of constraintsByType.should_not) {
					sections.push(`- ${constraint.rule}\n`);
				}
				sections.push("\n");
			}
		}

		/**
		 * Communication Style section
		 */
		if (this._tone) {
			sections.push("# Communication Style\n");
			sections.push(`${this._tone}\n`);
		}

		/**
		 * Output Format section
		 */
		if (this._outputFormat) {
			sections.push("# Output Format\n");
			sections.push(`${this._outputFormat}\n`);
		}

		return sections.join("").trim();
	}
}

/**
 * Factory function to create a new SystemPromptBuilder instance.
 *
 * This is the recommended way to create a builder. It provides a clean entry
 * point and allows for potential future enhancements (like pre-configured
 * builders or builder options) without breaking the API.
 *
 * @returns A new, empty SystemPromptBuilder instance ready for configuration
 *
 * @example
 * ```typescript
 * import { createPromptBuilder } from "promptsmith";
 *
 * const builder = createPromptBuilder();
 *
 * // Start chaining methods
 * const prompt = builder
 *   .identity("You are a helpful assistant")
 *   .capability("Answer questions")
 *   .build();
 * ```
 */
export function createPromptBuilder(): SystemPromptBuilder {
	return new SystemPromptBuilder();
}
