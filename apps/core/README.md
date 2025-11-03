# promptsmith-ts

**Type-safe system prompt builder for AI agents with fluent API**

A modern TypeScript library for building structured, maintainable system prompts for AI agents. Provides a fluent, chainable API that helps you craft production-ready prompts with type safety and security features.

## Installation

```bash
npm install promptsmith-ts zod ai
```

> **Note**: `zod` and `ai` (Vercel AI SDK) are peer dependencies. `zod` is required for tool schema validation, and `ai` is required for testing features.

## Quick Start

```typescript
import { createPromptBuilder } from "promptsmith-ts/builder";
import { z } from "zod";

const prompt = createPromptBuilder()
  .withIdentity("You are a helpful customer service assistant")
  .withCapabilities([
    "Answer product questions",
    "Process returns and exchanges",
    "Track order status",
  ])
  .withTool({
    name: "search_products",
    description: "Search product catalog",
    schema: z.object({
      query: z.string().describe("Search query"),
      category: z.string().optional(),
    }),
  })
  .withConstraint(
    "must",
    "Always verify order number before processing returns"
  )
  .withTone("Friendly, professional, and helpful")
  .build();
```

## 🚀 New Features

### Templates Library

Start with production-ready templates for common use cases:

```typescript
import { customerService, security } from "promptsmith-ts/templates";

// Use optimized templates
const builder = customerService({
  companyName: "TechStore",
  supportEmail: "help@techstore.com",
});

// Available templates:
// - customerService() - E-commerce support
// - codingAssistant() - Code help and debugging
// - dataAnalyst() - Data analysis and insights
// - researchAssistant() - Academic research
// - security() - Reusable security patterns
// - multilingual() - Multi-language support
// - accessibility() - Accessibility best practices
```

### Testing Framework

Test your prompts with real LLM responses:

```typescript
import { createTester } from "promptsmith-ts/tester";
import { openai } from "@ai-sdk/openai";

const tester = createTester();
const results = await tester.test({
  prompt: builder, // or use a string prompt
  provider: openai("gpt-4"),
  testCases: [
    {
      query: "Hello!",
      expectedBehavior: "Respond with a friendly greeting",
    },
    {
      query: "Can you give me medical advice?",
      expectedBehavior: "Politely decline and explain limitations",
    },
  ],
});

console.log(`Score: ${results.overallScore}/100`);
console.log(`Passed: ${results.passed}, Failed: ${results.failed}`);
```

### Builder Composition

Reuse and compose prompts with `.extend()` and `.merge()`:

```typescript
// Create base prompt
const baseSupport = createPromptBuilder()
  .withIdentity("You are a support assistant")
  .withCapabilities(["Answer questions"])
  .withGuardrails();

// Extend for specialized version (doesn't modify original)
const technicalSupport = baseSupport
  .extend()
  .withCapability("Debug technical issues")
  .withContext("Product: SaaS Platform");

// Merge reusable patterns
const secureSupport = baseSupport.merge(security());
```

## Requirements

- **Node.js**: >= 18.0.0
- **TypeScript**: >= 5.0.0 (optional but recommended)
- **Peer Dependencies**:
  - `zod` >= 4.0.0 (required for tool schema validation)
  - `ai` >= 4.0.0 (required for testing features)

## TypeScript Support

This library is written in TypeScript and provides full type definitions. No additional `@types` package needed.

```typescript
import type {
  SystemPromptBuilder,
  ToolDefinition,
  ExecutableToolDefinition,
  ConstraintType,
  Example,
  AiSdkConfig,
} from "promptsmith-ts/builder";

import type {
  TestCase,
  TestOptions,
  TestResult,
} from "promptsmith-ts/tester";
```

## API Reference

### `createPromptBuilder(): SystemPromptBuilder`

Factory function that creates a new `SystemPromptBuilder` instance.

```typescript
const builder = createPromptBuilder();
```

### Builder Methods

All configuration methods return the builder instance for method chaining.

#### `withIdentity(text: string): this`

Sets the agent's core identity or purpose. This appears first in the generated prompt.

```typescript
builder.withIdentity(
  "You are an expert travel assistant specializing in European destinations"
);
```

#### `withContext(text: string): this`

Provides domain-specific context and background knowledge to the agent.

```typescript
builder.withContext(`
  Clinic Information:
  - Operating hours: Monday-Friday, 9 AM - 5 PM
  - Three doctors available: Dr. Smith, Dr. Jones, Dr. Lee
  - Average appointment duration: 30 minutes
`);
```

#### `withCapability(cap: string): this`

Adds a single capability to the agent's skillset.

```typescript
builder.withCapability("Search and analyze research papers");
```

#### `withCapabilities(caps: string[]): this`

Adds multiple capabilities at once. Empty strings are automatically filtered out.

```typescript
builder.withCapabilities([
  "Analyze financial data and trends",
  "Calculate investment returns",
  "Provide risk assessments",
]);
```

#### `withTool<T>(def: ExecutableToolDefinition<T>): this`

Registers a tool that the agent can use. The Zod schema is introspected to create human-readable parameter documentation.

```typescript
builder.withTool({
  name: "get_weather",
  description: "Retrieves current weather for a location",
  schema: z.object({
    location: z.string().describe("City name or ZIP code"),
    units: z.enum(["celsius", "fahrenheit"]).optional(),
  }),
  // Optional: execution logic for AI SDK integration
  execute: async ({ location }) => {
    const response = await fetch(`https://api.weather.com/${location}`);
    return response.json();
  },
});
```

#### `withTools(defs: ExecutableToolDefinition[]): this`

Registers multiple tools at once.

```typescript
builder.withTools([
  { name: "tool1", description: "...", schema: z.object({...}) },
  { name: "tool2", description: "...", schema: z.object({...}), execute: async (...) => {...} },
]);
```

#### `withConstraint(type: ConstraintType, rule: string): this`

Adds a behavioral constraint or guideline. Constraint types:

- `"must"`: Absolute requirements that cannot be violated
- `"must_not"`: Absolute prohibitions
- `"should"`: Strong recommendations to follow when possible
- `"should_not"`: Strong recommendations to avoid

```typescript
builder
  .withConstraint(
    "must",
    "Always verify user authentication before accessing personal data"
  )
  .withConstraint("must_not", "Never store or log sensitive information")
  .withConstraint(
    "should",
    "Provide concise responses unless detail is requested"
  );
```

#### `withExamples(examples: Example[]): this`

Provides examples of desired agent behavior through few-shot learning.

```typescript
builder.withExamples([
  {
    user: "What's the weather in Paris?",
    assistant: "I'll check the weather for you. *calls get_weather tool*",
    explanation: "Shows proper tool invocation for weather queries",
  },
  {
    input: "Error: connection timeout",
    output: "I'm experiencing a connection issue. Let me try again.",
    explanation: "Demonstrates friendly error handling",
  },
]);
```

**Example Object Types:**

- Conversational style: `{ user: string, assistant: string, explanation?: string }`
- Functional style: `{ input: string, output: string, explanation?: string }`

#### `withErrorHandling(instructions: string): this`

Defines how the agent should handle uncertainty, errors, and ambiguous situations.

```typescript
builder.withErrorHandling(`
  Error Handling Guidelines:
  - If a request is ambiguous, ask specific clarifying questions
  - If you lack required information, explicitly list what's needed
  - If uncertain about facts, acknowledge uncertainty rather than guessing
`);
```

#### `withGuardrails(): this`

Enables standard anti-prompt-injection security guardrails. Adds comprehensive security measures to protect against prompt injection attacks.

```typescript
builder.withGuardrails();
```

#### `withForbiddenTopics(topics: string[]): this`

Specifies topics that the agent must not discuss or provide information about.

```typescript
builder.withForbiddenTopics([
  "Medical diagnosis or treatment advice",
  "Legal advice or interpretation of laws",
  "Financial investment recommendations",
]);
```

#### `withTone(tone: string): this`

Sets the communication tone and style for the agent.

```typescript
builder.withTone(
  "Be friendly, enthusiastic, and encouraging. Use a conversational tone."
);
```

#### `withOutput(format: string): this`

Sets the output format guidelines for the agent's responses.

```typescript
builder.withOutput(`
  Format responses as:
  1. Acknowledge the issue
  2. Provide solution or next steps
  3. Ask if there's anything else needed
`);
```

### Output Methods

#### `build(): string`

Generates and returns the complete system prompt as a markdown string. Only sections with content are included.

```typescript
const prompt = builder.build();
```

#### `toAiSdk(): AiSdkConfig`

Exports a complete AI SDK configuration object with both the system prompt and tools. Ready to spread into Vercel AI SDK function calls.

```typescript
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

const config = builder.toAiSdk();

const response = await generateText({
  model: openai("gpt-4"),
  ...config, // { system, tools }
  prompt: "What's the weather in Paris?",
});
```

#### `toAiSdkTools(): Record<string, { description: string, parameters: ZodType, execute?: Function }>`

Exports tools in Vercel AI SDK format. Tools without an `execute` function will have `execute` set to `undefined`.

```typescript
const tools = builder.toAiSdkTools();
```

#### `getTools(): ExecutableToolDefinition[]`

Returns the list of registered tools.

```typescript
const tools = builder.getTools();
```

#### `toJSON(): object`

Exports the builder's configuration as a plain JavaScript object. Useful for serialization, debugging, or transmitting configuration.

```typescript
const config = builder.toJSON();
```

## Type Definitions

### `ToolDefinition<T extends ZodType>`

Base tool definition interface:

```typescript
type ToolDefinition<T extends ZodType> = {
  name: string;
  description: string;
  schema: T;
};
```

### `ExecutableToolDefinition<T extends ZodType>`

Extended tool definition with optional execution logic:

```typescript
type ExecutableToolDefinition<T extends ZodType> = ToolDefinition<T> & {
  execute?: (args: z.infer<T>) => Promise<unknown> | unknown;
};
```

### `ConstraintType`

Constraint severity levels:

```typescript
type ConstraintType = "must" | "must_not" | "should" | "should_not";
```

### `Example`

Example object for few-shot learning:

```typescript
type Example = {
  user?: string;
  assistant?: string;
  input?: string;
  output?: string;
  explanation?: string;
};
```

### `AiSdkConfig`

Configuration object for Vercel AI SDK:

```typescript
type AiSdkConfig = {
  system: string;
  tools: Record<
    string,
    {
      description: string;
      parameters: ZodType;
      execute?: (args: unknown) => Promise<unknown> | unknown;
    }
  >;
};
```

## Usage Examples

### Basic Configuration

```typescript
import { createPromptBuilder } from "promptsmith-ts/builder";

const prompt = createPromptBuilder()
  .withIdentity("You are an expert travel assistant")
  .withCapabilities([
    "Recommend destinations",
    "Find flight deals",
    "Suggest activities",
  ])
  .withTone("Enthusiastic and knowledgeable")
  .build();
```

### With Tools and AI SDK Integration

```typescript
import { createPromptBuilder } from "promptsmith-ts/builder";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const builder = createPromptBuilder()
  .withIdentity("Weather assistant")
  .withTool({
    name: "get_weather",
    description: "Get current weather for a location",
    schema: z.object({
      location: z.string().describe("City name or coordinates"),
    }),
    execute: async ({ location }) => {
      const response = await fetch(`https://api.weather.com/${location}`);
      return response.json();
    },
  })
  .withTone("Friendly and informative");

// Use with AI SDK
const response = await generateText({
  model: openai("gpt-4"),
  ...builder.toAiSdk(),
  prompt: "What's the weather in Tokyo?",
});
```

### Security Configuration

```typescript
const prompt = createPromptBuilder()
  .withIdentity("Healthcare chatbot")
  .withGuardrails() // Anti-prompt-injection protections
  .withForbiddenTopics([
    "Medical diagnosis or treatment advice",
    "Prescription medication recommendations",
  ])
  .withErrorHandling(
    `
    If a user asks for medical advice:
    - Politely decline and explain limitations
    - Suggest consulting a healthcare professional
  `
  )
  .build();
```

### Comprehensive Example

```typescript
const prompt = createPromptBuilder()
  .withIdentity("You are an expert e-commerce customer service assistant")
  .withContext(
    `
    Store Policies:
    - Free shipping on orders over $50
    - 30-day return policy with receipt
    - Price match guarantee within 14 days
  `
  )
  .withCapabilities([
    "Answer product questions and comparisons",
    "Process returns, exchanges, and refunds",
    "Track order status and shipping",
  ])
  .withTool({
    name: "search_products",
    description: "Search product catalog",
    schema: z.object({
      query: z.string(),
      category: z.string().optional(),
    }),
  })
  .withExamples([
    {
      user: "I want to return my laptop",
      assistant: "I can help with that return. Do you have your order number?",
      explanation: "Gather necessary info before processing returns",
    },
  ])
  .withConstraint(
    "must",
    "Always verify order number before processing returns"
  )
  .withConstraint("must_not", "Never offer discounts beyond company policy")
  .withErrorHandling(
    `
    If you cannot find order information:
    1. Double-check the order number with the customer
    2. Ask for the email used to place the order
  `
  )
  .withGuardrails()
  .withForbiddenTopics([
    "Employee information or internal policies",
    "Other customers' orders or data",
  ])
  .withTone("Professional, empathetic, and solution-oriented")
  .withOutput(
    `
    Format responses as:
    1. Acknowledge the issue
    2. Provide solution or next steps
    3. Ask if there's anything else needed
  `
  )
  .build();
```

## Module Exports

### Default Export

```typescript
import { createPromptBuilder } from "promptsmith-ts/builder";
```

### Type Exports

```typescript
import type {
  SystemPromptBuilder,
  ToolDefinition,
  ExecutableToolDefinition,
  Constraint,
  ConstraintType,
  Example,
  AiSdkConfig,
} from "promptsmith-ts/builder";
```

### Schema Utilities (Internal)

The library also exports schema parsing utilities for Zod introspection:

```typescript
import { parseZodSchema, getZodTypeName } from "promptsmith-ts/builder";
```

## License

MIT License - see the [LICENSE](../../LICENSE) file for details.

## Repository

- **GitHub**: [galfrevn/promptsmith](https://github.com/galfrevn/promptsmith)
- **NPM**: [promptsmith-ts](https://www.npmjs.com/package/promptsmith-ts)

## Contributing

Contributions are welcome! Please see the [Contributing Guide](https://github.com/galfrevn/promptsmith/blob/main/CONTRIBUTING.md) for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/galfrevn/promptsmith/issues)
- **Discussions**: [GitHub Discussions](https://github.com/galfrevn/promptsmith/discussions)
