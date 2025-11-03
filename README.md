<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/promptsmith.png">
    <source media="(prefers-color-scheme: light)" srcset="./assets/promptsmith.png">
    <img src="./assets/promptsmith.png" alt="Promptsmith Logo" width="120" height="120">
  </picture>

  <h1 align="center">Promptsmith</h1>

  <p align="center">
    <strong>Type-Safe System Prompt Builder for AI Agents</strong>
    <br />
    Craft production-ready system prompts with a fluent, chainable API
    <br />
    <br />
    <a href="#quick-start"><strong>Get Started »</strong></a>
    <br />
    <br />
    <a href="#features">Features</a>
    ·
    <a href="#installation">Installation</a>
    ·
    <a href="#usage">Usage</a>
    ·
    <a href="#api-reference">API Docs</a>
    ·
    <a href="#contributing">Contributing</a>
  </p>

  <p align="center">
    <a href="https://www.npmjs.com/package/promptsmith">
      <img src="https://img.shields.io/npm/v/promptsmith?style=flat&colorA=000000&colorB=000000" alt="NPM Version">
    </a>
    <a href="https://www.npmjs.com/package/promptsmith">
      <img src="https://img.shields.io/npm/dm/promptsmith?style=flat&colorA=000000&colorB=000000" alt="NPM Downloads">
    </a>
    <a href="https://github.com/galfrevn/promptsmith">
      <img src="https://img.shields.io/github/stars/galfrevn/promptsmith?style=flat&colorA=000000&colorB=000000" alt="GitHub Stars">
    </a>
    <a href="https://github.com/galfrevn/promptsmith/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/galfrevn/promptsmith?style=flat&colorA=000000&colorB=000000" alt="License">
    </a>
    <a href="https://github.com/galfrevn/promptsmith">
      <img src="https://img.shields.io/badge/TypeScript-5.7-blue?style=flat&colorA=000000&colorB=000000" alt="TypeScript">
    </a>
  </p>
</div>

## About Promptsmith

Promptsmith is a modern TypeScript library for building structured, maintainable system prompts for AI agents. Instead of juggling string concatenation and template literals, Promptsmith provides a fluent, chainable API that helps you craft production-ready prompts with confidence.

Whether you're building chatbots, AI assistants, or autonomous agents, Promptsmith ensures your system prompts are clear, organized, and type-safe.

### 🎯 Key Features

- **🔧 Fluent Builder API**: Chain methods naturally to construct complex prompts
- **📚 Few-Shot Learning**: Built-in support for examples and demonstrations
- **🛡️ Security First**: Anti-prompt-injection guardrails and content restrictions
- **🎨 Structured Output**: Organize prompts into clear, semantic sections
- **⚡ AI SDK Integration**: First-class support for Vercel AI SDK
- **📝 Type-Safe**: Full TypeScript support with intelligent autocomplete
- **🎭 Behavioral Control**: Fine-grained constraints and guidelines
- **🌐 Context Management**: Domain-specific knowledge and background info
- **❌ Error Handling**: Define uncertainty and edge case behavior
- **🔄 Tool Integration**: Document and execute agent tools seamlessly

## Installation

```bash
# npm
npm install promptsmith-ts zod

# pnpm
pnpm add promptsmith-ts zod

# yarn
yarn add promptsmith-ts zod

# bun
bun add promptsmith-ts zod
```

> **Note**: Zod is a peer dependency required for tool schema validation.

## Quick Start

```typescript
import { createPromptBuilder } from "promptsmith-ts/builder";
import { z } from "zod";

const prompt = createPromptBuilder()
  .identity("You are a helpful customer service assistant for TechStore")
  .context(
    `
    Business hours: Monday-Friday, 9 AM - 6 PM EST
    Return policy: 30 days with receipt
    Free shipping on orders over $50
  `
  )
  .capabilities([
    "Answer product questions",
    "Process returns and exchanges",
    "Track order status",
  ])
  .examples([
    {
      user: "Where is my order?",
      assistant:
        "I'd be happy to help track your order. Could you provide your order number?",
      explanation: "Always ask for order number before looking up orders",
    },
  ])
  .guardrails()
  .forbiddenTopics(["Medical advice", "Legal advice"])
  .tone("Friendly, professional, and helpful")
  .build();

console.log(prompt);
```

**Output:**

```markdown
# Identity

You are a helpful customer service assistant for TechStore

# Context

Business hours: Monday-Friday, 9 AM - 6 PM EST
Return policy: 30 days with receipt
Free shipping on orders over $50

# Capabilities

1. Answer product questions
2. Process returns and exchanges
3. Track order status

# Examples

Here are examples demonstrating desired behavior patterns:

## Example 1

**User:** Where is my order?

**Assistant:** I'd be happy to help track your order. Could you provide your order number?

_Always ask for order number before looking up orders_

# Security Guardrails

...

# Content Restrictions

...

# Communication Style

Friendly, professional, and helpful
```

## Usage

### Basic Configuration

```typescript
import { createPromptBuilder } from "promptsmith-ts/builder";

const prompt = createPromptBuilder()
  .identity("You are an expert travel assistant")
  .capabilities([
    "Recommend destinations",
    "Find flight deals",
    "Suggest activities",
  ])
  .tone("Enthusiastic and knowledgeable")
  .build();
```

### Adding Context

Provide domain-specific knowledge your agent needs:

```typescript
const prompt = createPromptBuilder()
  .identity("Medical appointment scheduler")
  .context(
    `
    Clinic Information:
    - Operating hours: Monday-Friday, 9 AM - 5 PM
    - Three doctors:
      * Dr. Smith (General Medicine)
      * Dr. Jones (Cardiology)  
      * Dr. Lee (Pediatrics)
    - Average appointment: 30 minutes
  `
  )
  .build();
```

### Few-Shot Learning with Examples

Teach your agent by example:

```typescript
const prompt = createPromptBuilder()
  .identity("Weather assistant")
  .examples([
    {
      user: "What's the weather in Paris?",
      assistant:
        "I'll check the weather for you. *calls get_weather tool with location: Paris*",
      explanation: "Shows proper tool usage for weather queries",
    },
    {
      user: "Is it raining?",
      assistant: "Could you let me know which city you're asking about?",
      explanation: "Demonstrates asking for missing information",
    },
  ])
  .build();
```

### Tool Integration

Register tools your agent can use:

```typescript
import { z } from "zod";

const prompt = createPromptBuilder()
  .identity("Research assistant")
  .tool({
    name: "search_papers",
    description:
      "Search academic papers by keyword. Use when user asks about research.",
    schema: z.object({
      query: z.string().describe("Search query"),
      limit: z.number().optional().describe("Max results to return"),
    }),
  })
  .tool({
    name: "get_citation",
    description: "Generate citation for a paper",
    schema: z.object({
      paperId: z.string().describe("Paper ID to cite"),
      format: z.enum(["APA", "MLA", "Chicago"]).describe("Citation format"),
    }),
  })
  .build();
```

### Behavioral Guidelines

Define rules and constraints:

```typescript
const prompt = createPromptBuilder()
  .identity("Financial advisor assistant")
  .constraint("must", "Always verify user identity before discussing accounts")
  .constraint("must", "Cite sources for all financial data")
  .constraint("must_not", "Never provide specific investment recommendations")
  .constraint("must_not", "Never share information about other customers")
  .constraint(
    "should",
    "Suggest consulting a licensed advisor for major decisions"
  )
  .constraint(
    "should_not",
    "Avoid using complex financial jargon without explanation"
  )
  .build();
```

### Security & Content Restrictions

Protect against prompt injection and restrict topics:

```typescript
const prompt = createPromptBuilder()
  .identity("Healthcare chatbot")
  .guardrails() // Enables anti-prompt-injection protections
  .forbiddenTopics([
    "Medical diagnosis or treatment advice",
    "Prescription medication recommendations",
    "Interpretation of medical test results",
  ])
  .errorHandling(
    `
    If a user asks for medical advice:
    - Politely decline and explain limitations
    - Suggest consulting a healthcare professional
    - Offer to help with appointment scheduling instead
  `
  )
  .build();
```

### AI SDK Integration (Vercel)

Promptsmith works seamlessly with Vercel AI SDK:

```typescript
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { createPromptBuilder } from "promptsmith-ts/builder";
import { z } from "zod";

const builder = createPromptBuilder()
  .identity("Weather assistant")
  .context("Provide weather information for any city worldwide")
  .tool({
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
  .tone("Friendly and informative");

// Use with AI SDK
const response = await generateText({
  model: openai("gpt-4"),
  ...builder.toAiSdk(), // Returns { system, tools }
  prompt: "What's the weather in Tokyo?",
});
```

### Complete Example

Here's a comprehensive example showing all features:

```typescript
const prompt = createPromptBuilder()
  // Core identity
  .identity(
    "You are an expert e-commerce customer service assistant for TechStore"
  )

  // Domain context
  .context(
    `
    Store Policies:
    - Free shipping on orders over $50
    - 30-day return policy with receipt
    - Price match guarantee within 14 days
    - Extended warranty available on electronics
    
    Support Hours: 24/7 via chat, phone 9 AM - 9 PM EST
  `
  )

  // Capabilities
  .capabilities([
    "Answer product questions and comparisons",
    "Process returns, exchanges, and refunds",
    "Track order status and shipping",
    "Handle complaints and escalations",
    "Provide technical support for electronics",
  ])

  // Tools
  .tool({
    name: "search_products",
    description: "Search product catalog",
    schema: z.object({
      query: z.string(),
      category: z.string().optional(),
    }),
  })
  .tool({
    name: "track_order",
    description: "Get order status",
    schema: z.object({
      orderId: z.string(),
    }),
  })

  // Few-shot examples
  .examples([
    {
      user: "I want to return my laptop",
      assistant:
        "I can help with that return. Do you have your order number handy?",
      explanation: "Gather necessary info before processing returns",
    },
  ])

  // Behavioral rules
  .constraint("must", "Always verify order number before processing returns")
  .constraint("must_not", "Never offer discounts beyond company policy")
  .constraint("should", "Proactively suggest related products when appropriate")

  // Error handling
  .errorHandling(
    `
    If you cannot find order information:
    1. Double-check the order number with the customer
    2. Ask for the email used to place the order
    3. If still not found, escalate to supervisor
  `
  )

  // Security
  .guardrails()
  .forbiddenTopics([
    "Employee information or internal policies",
    "Other customers' orders or data",
    "Unreleased products or features",
  ])

  // Output style
  .tone("Professional, empathetic, and solution-oriented")
  .output(
    `
    Format responses as:
    1. Acknowledge the issue
    2. Provide solution or next steps
    3. Ask if there's anything else needed
  `
  )

  .build();
```

## API Reference

### Core Methods

#### `identity(text: string)`

Set the agent's core identity and role.

```typescript
builder.identity("You are a helpful coding assistant");
```

#### `context(text: string)`

Provide domain-specific background knowledge.

```typescript
builder.context("Our API uses REST endpoints with JSON responses");
```

#### `capability(cap: string)` / `capabilities(caps: string[])`

Define what the agent can do.

```typescript
builder.capabilities(["Write code", "Explain concepts", "Debug errors"]);
```

#### `tool(def: ToolDefinition)` / `tools(defs: ToolDefinition[])`

Register tools with optional execution logic.

```typescript
builder.tool({
  name: "search",
  description: "Search the knowledge base",
  schema: z.object({ query: z.string() }),
  execute: async ({ query }) => {
    /* ... */
  },
});
```

#### `examples(examples: Example[])`

Provide few-shot learning examples.

```typescript
builder.examples([{ user: "Hello", assistant: "Hi! How can I help?" }]);
```

#### `constraint(type: ConstraintType, rule: string)`

Add behavioral guidelines. Types: `'must'`, `'must_not'`, `'should'`, `'should_not'`.

```typescript
builder.constraint("must", "Always verify user authentication");
```

#### `errorHandling(instructions: string)`

Define how to handle uncertainty and errors.

```typescript
builder.errorHandling("When unsure, ask clarifying questions");
```

#### `guardrails()`

Enable anti-prompt-injection security measures.

```typescript
builder.guardrails();
```

#### `forbiddenTopics(topics: string[])`

Specify topics the agent must not discuss.

```typescript
builder.forbiddenTopics(["Medical advice", "Legal advice"]);
```

#### `tone(tone: string)`

Set the communication style.

```typescript
builder.tone("Friendly and professional");
```

#### `output(format: string)`

Define the response structure.

```typescript
builder.output("Respond in JSON format with {answer, confidence, sources}");
```

### Output Methods

#### `build(): string`

Generate the final system prompt as markdown.

```typescript
const prompt = builder.build();
```

#### `toAiSdk(): { system: string, tools: Record<string, any> }`

Export for Vercel AI SDK.

```typescript
const { system, tools } = builder.toAiSdk();
```

#### `toAiSdkTools(): Record<string, ToolDefinition>`

Export only tools for AI SDK.

```typescript
const tools = builder.toAiSdkTools();
```

#### `toJSON(): object`

Export configuration as JSON.

```typescript
const config = builder.toJSON();
```

#### `getTools(): ToolDefinition[]`

Get registered tools.

```typescript
const tools = builder.getTools();
```

## Project Structure

```
promptsmith/
├── apps/
│   ├── core/              # Main library package
│   │   ├── src/
│   │   │   ├── builder.ts # SystemPromptBuilder class
│   │   │   ├── schemas.ts # Zod schema utilities
│   │   │   └── types.ts   # TypeScript type definitions
│   │   ├── __tests__/     # Comprehensive test suite
│   │   └── package.json
│   └── docs/              # Documentation site
├── assets/                # Brand assets
└── README.md
```

## Examples

Check out the `/examples` directory for complete use cases:

- **Customer Service Bot**: E-commerce support with returns and tracking
- **Code Assistant**: Developer helper with code generation tools
- **Healthcare Scheduler**: HIPAA-compliant appointment booking
- **Research Assistant**: Academic paper search and citation
- **Travel Planner**: Itinerary creation with real-time data

## Best Practices

### 1. Keep Identity Clear and Specific

```typescript
// ✅ Good
.identity('You are a senior software engineer specializing in React and TypeScript')

// ❌ Too vague
.identity('You are helpful')
```

### 2. Provide Relevant Context

```typescript
// ✅ Good
.context(`
  Tech Stack: React 18, Next.js 14, TypeScript
  Conventions: Functional components, hooks, server components when possible
  Testing: Jest + React Testing Library
`)

// ❌ Missing context
.context('We use React')
```

### 3. Use Examples for Complex Behaviors

```typescript
// ✅ Shows exact desired pattern
.examples([
  {
    user: 'How do I center a div?',
    assistant: 'Here are 3 modern approaches:\n1. Flexbox...',
    explanation: 'Provide multiple solutions with pros/cons'
  }
])
```

### 4. Layer Security Appropriately

```typescript
// ✅ Defense in depth
.guardrails()
.forbiddenTopics(['PII', 'Credentials'])
.constraint('must', 'Verify authentication for sensitive operations')
```

### 5. Handle Errors Gracefully

```typescript
.errorHandling(`
  Priority order:
  1. Ask clarifying questions if request is ambiguous
  2. Suggest alternatives if outside capabilities
  3. Admit uncertainty rather than guessing
  4. Escalate to human if critical issue
`)
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone repository
git clone https://github.com/galfrevn/promptsmith.git
cd promptsmith

# Install dependencies
bun install

# Run tests
bun test

# Build library
bun run build

# Format code
bun run check
```

### Running Tests

```bash
# Run all tests
bun test

# Watch mode
bun test --watch

# Coverage
bun test --coverage
```

## Roadmap

- [x] ✅ **v0.1**: Core builder API with type safety
- [x] ✅ **v0.2**: Security features (guardrails, forbidden topics)
- [x] ✅ **v0.3**: Tier 1 methods (context, examples, error handling)
- [ ] 🎯 **v1.0**: Stable API, comprehensive documentation, npm publish
- [ ] 🔄 **v1.1**: Template variables, dynamic content injection
- [ ] 🧠 **v1.2**: Memory/conversation history methods
- [ ] 📊 **v1.3**: Chain-of-thought reasoning configuration
- [ ] 🔌 **v1.4**: Plugin system for custom extensions
- [ ] 🎭 **v1.5**: Persona switching and role management
- [ ] 📚 **v2.0**: Advanced tool orchestration, retrieval methods

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: [View Full Docs](./apps/docs)
- **Issues**: [GitHub Issues](https://github.com/galfrevn/promptsmith/issues)
- **Discussions**: [GitHub Discussions](https://github.com/galfrevn/promptsmith/discussions)
- **Twitter**: [@galfrevn](https://twitter.com/galfrevn)

## Acknowledgments

Built with inspiration from modern prompt engineering practices and the amazing developer tools ecosystem.

Special thanks to:

- [Vercel AI SDK](https://sdk.vercel.ai/) for AI integration patterns
- [Zod](https://zod.dev/) for schema validation
- The prompt engineering community

---

<div align="center">
  <strong>Built with ❤️ for the AI developer community</strong>
  <br />
  <br />
  <a href="https://github.com/galfrevn/promptsmith">⭐ Star on GitHub</a>
  ·
  <a href="https://www.npmjs.com/package/promptsmith">📦 View on NPM</a>
</div>
