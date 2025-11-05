<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/promptsmith-white.svg">
    <source media="(prefers-color-scheme: light)" srcset="./assets/promptsmith-black.svg">
    <img src="./assets/promptsmith-black.svg" alt="PromptSmith Logo" width="120" height="120">
  </picture>

  <h1 align="center">PromptSmith</h1>

  <p align="center">
    <strong>Type-Safe System Prompt Builder for Production AI Agents</strong>
    <br />
    Stop wrestling with prompt strings. Start building AI agents that actually work.
    <br />
    <br />
    <a href="#getting-started"><strong>Get Started »</strong></a>
    <br />
    <br />
    <a href="#features">Features</a>
    ·
    <a href="#tech-stack">Tech Stack</a>
    ·
    <a href="#api-reference">API Docs</a>
    ·
    <a href="#examples">Examples</a>
  </p>

  <p align="center">
    <a href="https://www.npmjs.com/package/promptsmith-ts">
      <img src="https://img.shields.io/npm/v/promptsmith-ts.svg" alt="npm version">
    </a>
    <a href="https://opensource.org/licenses/MIT">
      <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT">
    </a>
  </p>
</div>

---

## About PromptSmith

PromptSmith is a structured, type-safe, and testable solution for building AI agent prompts that scale. Built specifically for the [Vercel AI SDK](https://sdk.vercel.ai/), it transforms prompt engineering into software engineering.

Instead of managing 500-line template strings and copy-pasting security rules, PromptSmith provides a fluent API for creating production-ready AI agents with built-in security, tool integration, and token optimization.

### 🎯 Key Features

- **🔒 Type-Safe Tools**: Zod schemas with autocomplete and type checking - no more runtime errors
- **🛡️ Security Built-In**: One-line guardrails against prompt injection and forbidden topics
- **🧩 Composable & Reusable**: Create base prompts, extend them, and merge security patterns
- **🔗 AI SDK Native**: `.toAiSdk()` exports ready-to-use configurations for `generateText`, `streamText`, and `generateObject`
- **🧪 Test Your Prompts**: Built-in testing framework with real LLM validation
- **📦 Production Templates**: Pre-built templates for customer service, coding assistants, data analysis, and more
- **⚡ Token Optimization**: TOON format reduces token usage by 30-60%, significantly lowering API costs
- **🎨 Multiple Output Formats**: Markdown, TOON, or compact formats for different use cases

## Tech Stack

PromptSmith is built using modern technologies:

### Core Libraries
- **[TypeScript](https://www.typescriptlang.org/)** - Full type safety throughout
- **[Zod](https://zod.dev/)** - Runtime type validation and schema introspection
- **[Vercel AI SDK](https://sdk.vercel.ai/)** - AI model integration (peer dependency)

### Development & Build
- **[Bun](https://bun.sh/)** - Fast JavaScript runtime and package manager
- **[Turbo](https://turbo.build/)** - High-performance monorepo build system
- **[Biome](https://biomejs.dev/)** - Fast linter and formatter

### Documentation
- **[Next.js](https://nextjs.org/)** - Documentation website framework
- **[Fumadocs](https://fumadocs.vercel.app/)** - Documentation components

## Project Structure

```
promptsmith/
├── apps/
│   ├── core/                    # Main library package (promptsmith-ts)
│   │   ├── src/
│   │   │   ├── builder.ts       # SystemPromptBuilder class with fluent API
│   │   │   ├── schemas.ts       # Zod schema utilities and parameter parsing
│   │   │   ├── tester.ts        # Testing framework for LLM prompt validation
│   │   │   ├── templates/       # Pre-built templates
│   │   │   │   ├── customer-service.ts
│   │   │   │   ├── coding-assistant.ts
│   │   │   │   ├── data-analyst.ts
│   │   │   │   └── ...
│   │   │   └── types.ts         # TypeScript type definitions
│   │   └── scripts/
│   │       └── build.ts         # Custom build script
│   └── docs/                    # Documentation site (Next.js)
├── assets/                      # Logo and branding assets
└── package.json                 # Monorepo configuration
```

## Getting Started

### Prerequisites

- **[Node.js](https://nodejs.org/)** >= 18.0.0
- **[Bun](https://bun.sh/)** (v1.2.15 or later, for development)
- **TypeScript** >= 5.0.0 (recommended)

### Installation

```bash
npm install promptsmith-ts zod ai
```

**Peer Dependencies:**
- `zod` >= 4.0.0 - Schema validation and type inference
- `ai` >= 4.0.0 - Vercel AI SDK for LLM integration

### Quick Start

```typescript
import { createPromptBuilder } from "promptsmith-ts/builder";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

// Build your agent with a fluent API
const agent = createPromptBuilder()
  .withIdentity("You are a helpful customer service assistant")
  .withCapabilities(["Answer questions", "Process returns", "Track orders"])
  .withTool({
    name: "search_products",
    description: "Search product catalog",
    schema: z.object({
      query: z.string().describe("Search query"),
      category: z.string().optional(),
    }),
    execute: async ({ query, category }) => {
      return await db.products.search({ query, category });
    },
  })
  .withGuardrails() // Built-in security
  .withTone("Friendly, professional, and helpful");

// Deploy in one line
const response = await generateText({
  model: openai("gpt-4"),
  ...agent.toAiSdk(), // Complete config with tools
  prompt: "Find me a laptop under $1000",
});
```

### Start from Template

```typescript
import { customerService } from "promptsmith-ts/templates";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

// Pre-configured for e-commerce support
const agent = customerService({
  companyName: "TechStore",
  supportEmail: "help@techstore.com",
});

const { text } = await generateText({
  model: anthropic("claude-3-5-sonnet-20241022"),
  ...agent.toAiSdk(),
  prompt: "I need to return my laptop",
});
```

## Features

### Production-Ready Templates

Start fast with pre-built, optimized templates:

```typescript
import {
  customerService,
  codingAssistant,
  dataAnalyst,
  researchAssistant,
  security,
  multilingual,
  accessibility,
} from "promptsmith-ts/templates";

// Each template is pre-configured with best practices
const agent = customerService({
  companyName: "Your Company",
  supportEmail: "support@example.com",
});
```

### Test Your Agents Before Deploy

Run automated tests with real LLM responses:

```typescript
import { createTester } from "promptsmith-ts/tester";
import { openai } from "@ai-sdk/openai";

const tester = createTester();
const results = await tester.test({
  prompt: agent,
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

console.log(`✅ Passed: ${results.passed}/${results.total}`);
console.log(`📊 Score: ${results.overallScore}/100`);
```

### Composable & Extensible

Build once, reuse everywhere:

```typescript
// Create base agent
const baseSupport = createPromptBuilder()
  .withIdentity("You are a support assistant")
  .withCapabilities(["Answer questions", "Provide solutions"])
  .withGuardrails();

// Extend for specific use cases (doesn't modify original)
const technicalSupport = baseSupport
  .extend()
  .withCapability("Debug technical issues")
  .withContext("Product: SaaS Platform v2.0");

const billingSupport = baseSupport
  .extend()
  .withCapability("Process refunds and billing inquiries")
  .withContext("Payment processor: Stripe");

// Merge security patterns across all agents
const secureAgent = baseSupport.merge(security());
```

### Token Optimization with TOON Format

The **TOON (Token-Oriented Object Notation)** format reduces token usage by **30-60%** compared to standard markdown:

```typescript
const builder = createPromptBuilder()
  .withIdentity("You are a helpful assistant")
  .withCapabilities(["Answer questions", "Provide information"])
  .withFormat("toon"); // Set TOON format for token reduction

// Use in production
const response = await generateText({
  model: openai("gpt-4"),
  ...builder.toAiSdk(),
  prompt: userMessage,
});
```

**Format Comparison:**

| Format | Size | Use Case |
|--------|------|----------|
| **markdown** | 163 chars | Development, debugging, documentation |
| **toon** | 123 chars (25% smaller) | Production, high-volume, cost optimization |
| **compact** | 147 chars (10% smaller) | Staging, testing, moderate savings |

**Cost Impact Example:**

For a customer service application processing 100,000 conversations per month:
- Markdown format: ~500 tokens per system prompt
- TOON format: ~300 tokens per system prompt (40% reduction)
- Monthly savings: 200 tokens × 100,000 = 20M tokens
- **Cost savings (GPT-4 @ $0.01/1K tokens): $200/month**
- **Annual savings: $2,400**

Learn more in the [official TOON docs](https://github.com/toon-format/toon#readme).

## Development

### Clone the Repository

```bash
git clone https://github.com/galfrevn/promptsmith.git
cd promptsmith
```

### Install Dependencies

```bash
bun install
```

### Available Scripts

```bash
# Development
bun dev              # Start all apps in development mode
bun dev:docs         # Start documentation site only

# Build & Quality
bun build            # Build all packages and apps
bun test             # Run tests across the monorepo
bun test:coverage    # Run tests with coverage
bun lint             # Lint all files with Biome
bun format           # Format all files with Biome

# Core library specific (from apps/core/):
cd apps/core
bun build            # Build the library package
bun test             # Run library tests
bun types            # Type check without compilation
```

### Development Workflow

1. **Make changes** in `apps/core/src/`
2. **Add tests** in `apps/core/__tests__/`
3. **Run tests**: `bun test`
4. **Build library**: `bun build`
5. **Format code**: `bun format`
6. **Type check**: `bun types`

## Examples

### Next.js API Route - Customer Support

```typescript
// app/api/chat/route.ts
import { createPromptBuilder } from "promptsmith-ts/builder";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const supportAgent = createPromptBuilder()
  .withIdentity("You are TechStore's customer service assistant")
  .withContext(`
    Store Hours: Mon-Fri 9AM-6PM EST
    Return Policy: 30 days with receipt
    Free shipping on orders over $50
  `)
  .withCapabilities([
    "Search products and check inventory",
    "Track orders and shipments",
    "Process returns and exchanges",
  ])
  .withTool({
    name: "search_products",
    description: "Search product catalog by query",
    schema: z.object({
      query: z.string(),
      category: z.enum(["laptops", "phones", "accessories"]).optional(),
      maxPrice: z.number().optional(),
    }),
    execute: async ({ query, category, maxPrice }) => {
      const products = await db.products.search({ query, category, maxPrice });
      return products;
    },
  })
  .withConstraint("must", "Always verify order number before processing returns")
  .withConstraint("must_not", "Never offer discounts beyond 10% without manager approval")
  .withGuardrails()
  .withTone("Friendly, professional, and helpful");

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai("gpt-4-turbo"),
    ...supportAgent.toAiSdk(),
    messages,
  });

  return result.toDataStreamResponse();
}
```

### Secure Enterprise Agent

```typescript
import { createPromptBuilder } from "promptsmith-ts/builder";
import { security } from "promptsmith-ts/templates";
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

const internalAgent = createPromptBuilder()
  .withIdentity("You are a secure internal data assistant")
  .withContext("Access Level: Employee | Department: Engineering")
  .withTool({
    name: "query_database",
    description: "Query internal PostgreSQL database",
    schema: z.object({
      query: z.string().describe("SQL query to execute"),
      database: z.enum(["users", "analytics", "logs"]),
    }),
    execute: async ({ query, database }) => {
      const sanitized = sanitizeSQL(query);
      return await executeQuery(database, sanitized);
    },
  })
  .merge(security()) // Add security patterns
  .withForbiddenTopics([
    "Salary information of other employees",
    "Personal contact information",
    "Source code from private repositories",
  ])
  .withConstraint("must", "Always audit log all database queries")
  .withConstraint("must_not", "Never expose PII in responses");

const { object } = await generateObject({
  model: anthropic("claude-3-5-sonnet-20241022"),
  ...internalAgent.toAiSdk(),
  prompt: "Show me the top 5 users by engagement this month",
  schema: z.object({
    users: z.array(
      z.object({
        id: z.string(),
        username: z.string(),
        engagementScore: z.number(),
      })
    ),
  }),
});
```

### Multi-Model Support

```typescript
import { createPromptBuilder } from "promptsmith-ts/builder";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";

const agent = createPromptBuilder()
  .withIdentity("You are a helpful assistant")
  .withCapabilities(["Answer questions", "Provide insights"]);

const config = agent.toAiSdk();

// Use with OpenAI
const gpt4Response = await generateText({
  model: openai("gpt-4-turbo"),
  ...config,
  prompt: "Explain quantum computing",
});

// Use with Anthropic
const claudeResponse = await generateText({
  model: anthropic("claude-3-5-sonnet-20241022"),
  ...config,
  prompt: "Explain quantum computing",
});

// Use with Google
const geminiResponse = await generateText({
  model: google("gemini-1.5-pro"),
  ...config,
  prompt: "Explain quantum computing",
});
```

## API Reference

### `createPromptBuilder(): SystemPromptBuilder`

Factory function that creates a new `SystemPromptBuilder` instance.

```typescript
const builder = createPromptBuilder();
```

### Builder Methods

All configuration methods return the builder instance for method chaining.

#### Identity & Context

- **`withIdentity(text: string)`** - Sets the agent's core identity or purpose
- **`withContext(text: string)`** - Provides domain-specific context and background knowledge

#### Capabilities & Tools

- **`withCapability(cap: string)`** - Adds a single capability to the agent's skillset
- **`withCapabilities(caps: string[])`** - Adds multiple capabilities at once
- **`withTool<T>(def: ExecutableToolDefinition<T>)`** - Registers a tool with Zod schema
- **`withTools(defs: ExecutableToolDefinition[])`** - Registers multiple tools at once

#### Constraints & Security

- **`withConstraint(type: ConstraintType, rule: string)`** - Adds behavioral constraints ("must", "must_not", "should", "should_not")
- **`withGuardrails()`** - Enables standard anti-prompt-injection security guardrails
- **`withForbiddenTopics(topics: string[])`** - Specifies topics that the agent must not discuss

#### Examples & Style

- **`withExamples(examples: Example[])`** - Provides few-shot learning examples
- **`withTone(tone: string)`** - Sets the communication tone and style
- **`withOutput(format: string)`** - Sets the output format guidelines

#### Error Handling

- **`withErrorHandling(instructions: string)`** - Defines how to handle uncertainty and errors

#### Output Format

- **`withFormat(format: "markdown" | "toon" | "compact")`** - Sets the output format for token optimization

### Output Methods

- **`build(format?: string): string`** - Generates the complete system prompt as a string
- **`toAiSdk(): AiSdkConfig`** - Exports AI SDK configuration with system prompt and tools
- **`toAiSdkTools(): Record<string, ...>`** - Exports tools in Vercel AI SDK format
- **`getTools(): ExecutableToolDefinition[]`** - Returns the list of registered tools
- **`toJSON(): object`** - Exports the builder's configuration as a plain object

### Composition Methods

- **`extend(): SystemPromptBuilder`** - Creates a new builder with a copy of the current configuration
- **`merge(other: SystemPromptBuilder): SystemPromptBuilder`** - Merges another builder's configuration

## Use Cases

### 🛍️ E-Commerce Customer Support

Build agents that search products, handle returns, and answer questions—with built-in safety guardrails.

### 💻 Code Review & Generation

Create coding assistants with access to your codebase, documentation, and testing tools.

### 📊 Data Analysis Agents

Query databases, generate reports, and visualize data with natural language interfaces.

### 📚 Research & Documentation

Build agents that search knowledge bases, summarize documents, and answer domain-specific questions.

### 🔐 Secure Internal Tools

Enterprise agents with strict access controls, audit logging, and compliance requirements.

## Why PromptSmith?

### Before PromptSmith ❌

```typescript
// Unstructured, hard to maintain, no type safety
const systemPrompt = `
You are a customer service agent for TechStore.
You can search products, track orders...
Tools:
- search_products: searches the catalog
  - query (string, required)
IMPORTANT: Never reveal internal information...
`;

const tools = {
  search_products: {
    description: "Search products", // Duplicate docs
    parameters: z.object({ query: z.string() }),
    execute: searchProducts,
  },
};

// Error-prone: manually sync prompt text with tool schemas
const result = await generateText({
  model: openai("gpt-4"),
  system: systemPrompt,
  tools: tools,
  prompt: "Find laptops",
});
```

### With PromptSmith ✅

```typescript
import { createPromptBuilder } from "promptsmith-ts/builder";

const agent = createPromptBuilder()
  .withIdentity("You are a customer service agent for TechStore")
  .withCapabilities(["Search products", "Track orders"])
  .withTool({
    name: "search_products",
    description: "Search product catalog",
    schema: z.object({ query: z.string() }),
    execute: searchProducts, // Type-safe!
  })
  .withGuardrails(); // Security built-in

// Single source of truth, fully type-safe
const result = await generateText({
  model: openai("gpt-4"),
  ...agent.toAiSdk(), // One line integration
  prompt: "Find laptops",
});
```

### The Difference

| Feature | Manual Prompts | PromptSmith |
|---------|----------------|-------------|
| **Type Safety** | ❌ None | ✅ Full TypeScript support |
| **Tool Integration** | ❌ Manual sync | ✅ Automatic from schemas |
| **Reusability** | ❌ Copy-paste | ✅ Compose & extend |
| **Security** | ❌ DIY | ✅ Built-in guardrails |
| **Token Optimization** | ❌ None | ✅ TOON format (30-60% savings) |
| **Testing** | ❌ Manual | ✅ Automated framework |
| **Maintainability** | ❌ 500-line strings | ✅ Structured & organized |
| **AI SDK Integration** | ❌ Manual config | ✅ `.toAiSdk()` |

## Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Ensure code quality: `bun run lint && bun run format`
5. Run tests: `bun test`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Biome with consistent rules
- **Naming**: Descriptive, camelCase for variables, PascalCase for types
- **Comments**: JSDoc for public APIs, inline comments for complex logic

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Links & Resources

- 📦 **NPM**: [promptsmith-ts](https://www.npmjs.com/package/promptsmith-ts)
- 🐙 **GitHub**: [galfrevn/promptsmith](https://github.com/galfrevn/promptsmith)
- 📚 **Documentation**: [Full Docs](https://github.com/galfrevn/promptsmith#readme)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/galfrevn/promptsmith/discussions)
- 🐛 **Issues**: [Report Issues](https://github.com/galfrevn/promptsmith/issues)
- 🔗 **Vercel AI SDK**: [sdk.vercel.ai](https://sdk.vercel.ai/)
- 📖 **TOON Format**: [github.com/toon-format/toon](https://github.com/toon-format/toon#readme)

---

<div align="center">
  <strong>Built with ❤️ for the Vercel AI SDK community</strong>
  <br />
  <br />
  <a href="https://github.com/galfrevn/promptsmith">⭐ Star on GitHub</a>
  ·
  Made by <a href="https://github.com/galfrevn">@galfrevn</a>

  Hephaestus by parkjisun from <a href="https://thenounproject.com/browse/icons/term/hephaestus/" target="_blank" title="Hephaestus Icons">Noun Project</a> (CC BY 3.0)
</div>
