<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/promptsmith-white.svg">
    <source media="(prefers-color-scheme: light)" srcset="./assets/promptsmith-black.svg">
    <img src="./assets/promptsmith-black.svg" alt="PromptSmith Logo" width="160" height="160">
  </picture>

  <h1 align="center">PromptSmith</h1>

  <p align="center">
    <strong>Type-Safe System Prompt Builder for Production AI Agents</strong>
    <br />
    Stop wrestling with prompt strings. Start building AI agents that actually work.
  </p>

  <p align="center">
    <a href="https://www.npmjs.com/package/promptsmith-ts">
      <img src="https://img.shields.io/npm/v/promptsmith-ts.svg?style=for-the-badge" alt="npm version">
    </a>
    <a href="https://opensource.org/licenses/MIT">
      <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License: MIT">
    </a>
    <a href="https://github.com/galfrevn/promptsmith/graphs/contributors">
      <img src="https://img.shields.io/github/contributors/galfrevn/promptsmith?style=for-the-badge" alt="Contributors">
    </a>
    <a href="https://github.com/galfrevn/promptsmith/network/members">
      <img src="https://img.shields.io/github/forks/galfrevn/promptsmith?style=for-the-badge" alt="Forks">
    </a>
    <a href="https://github.com/galfrevn/promptsmith/stargazers">
      <img src="https://img.shields.io/github/stars/galfrevn/promptsmith?style=for-the-badge" alt="Stars">
    </a>
    <a href="https://github.com/galfrevn/promptsmith/issues">
      <img src="https://img.shields.io/github/issues/galfrevn/promptsmith?style=for-the-badge" alt="Issues">
    </a>
  </p>
</div>

---

## What is PromptSmith?

A type-safe, composable prompt builder for the [Vercel AI SDK](https://sdk.vercel.ai/). Build production-ready AI agents with built-in security, tool integration, and token optimization.

**For package documentation and API reference, see [apps/core/README.md](./apps/core/README.md)**

## Quick Example

```typescript
import { createPromptBuilder } from "promptsmith-ts/builder";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

// Build your agent with a fluent API
const agent = createPromptBuilder()
  .withIdentity("You are a helpful customer service assistant")
  .withCapabilities(["Answer questions", "Process returns"])
  .withTool({
    name: "search_products",
    description: "Search product catalog",
    schema: z.object({
      query: z.string().describe("Search query"),
    }),
    execute: async ({ query }) => {
      return await db.products.search({ query });
    },
  })
  .withGuardrails(); // Built-in security

// Deploy in one line
const response = await generateText({
  model: openai("gpt-4"),
  ...agent.toAiSdk(),
  prompt: "Find me a laptop under $1000",
});
```

## Project Structure

This is a monorepo managed with [Turbo](https://turbo.build/) and [Bun](https://bun.sh/).

```
promptsmith/
├── apps/
│   ├── core/              # Main library package (promptsmith-ts)
│   │   ├── src/
│   │   │   ├── builder.ts       # SystemPromptBuilder class
│   │   │   ├── schemas.ts       # Zod schema utilities
│   │   │   ├── tester.ts        # Testing framework
│   │   │   ├── templates/       # Pre-built templates
│   │   │   └── types.ts         # TypeScript definitions
│   │   └── __tests__/           # Test suite
│   └── docs/              # Documentation site (Next.js + Fumadocs)
├── assets/                # Logo and branding
├── CONTRIBUTING.md        # Contributing guidelines
└── package.json           # Monorepo configuration
```

## Tech Stack

- **[TypeScript](https://www.typescriptlang.org/)** - Full type safety
- **[Zod](https://zod.dev/)** - Runtime validation
- **[Vercel AI SDK](https://sdk.vercel.ai/)** - AI model integration
- **[Bun](https://bun.sh/)** - Fast runtime and package manager
- **[Turbo](https://turbo.build/)** - Monorepo build system
- **[Biome](https://biomejs.dev/)** - Linting and formatting



## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/galfrevn/promptsmith.git
cd promptsmith

# Install dependencies
bun install
```

### Available Commands

```bash
# Development
bun dev              # Start all apps in development mode
bun dev:docs         # Start documentation site

# Build & Quality
bun build            # Build all packages
bun test             # Run all tests
bun test:coverage    # Run tests with coverage
bun lint             # Lint all files
bun format           # Format all files

# Core library (from apps/core/)
cd apps/core
bun build            # Build the library
bun test             # Run library tests
```

### Workflow

1. Make changes in `apps/core/src/`
2. Add tests in `apps/core/__tests__/`
3. Run `bun test` to verify
4. Run `bun format` to format code
5. Create a pull request

## Key Features

- **🔒 Type-Safe Tools** - Zod schemas with full TypeScript support
- **🛡️ Security Built-In** - One-line guardrails against prompt injection
- **🧩 Composable** - Create base prompts and extend them
- **🧪 Testable** - Built-in framework for LLM validation
- **⚡ Token Optimization** - TOON format reduces usage by 30-60%
- **📦 Production Templates** - Pre-built for common use cases

**Format Efficiency Comparison:**

```
toon           ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   15.0  │  70.1% acc  │  4,678 tokens
csv            ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░   14.3  │  67.7% acc  │  4,745 tokens
json-compact   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░   11.0  │  65.3% acc  │  5,925 tokens
yaml           ▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░    9.4  │  66.7% acc  │  7,091 tokens
json-pretty    ▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░    7.5  │  65.4% acc  │  8,713 tokens
xml            ▓▓▓▓▓▓▓▓▓░░░░░░░░░░░    6.8  │  67.2% acc  │  9,944 tokens
```

*TOON format provides the best balance of efficiency and accuracy*

## Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

Please read our [Contributing Guide](CONTRIBUTING.md) for details on:

- Development setup and workflow
- Coding standards and best practices
- Testing requirements
- Pull request process
- How to report issues

Quick start for contributors:

```bash
# Fork and clone the repository
git clone https://github.com/galfrevn/promptsmith.git
cd promptsmith

# Install dependencies
bun install

# Make your changes, add tests, then run quality checks
bun lint && bun format && bun test

# Create a pull request
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for complete guidelines.

## License
MIT License - see [LICENSE](LICENSE) for details.

## Links

- 📦 [NPM Package](https://www.npmjs.com/package/promptsmith-ts)
- 📚 [Full Documentation](./apps/core/README.md)
- 🐙 [GitHub Repository](https://github.com/galfrevn/promptsmith)
- 🐛 [Report Issues](https://github.com/galfrevn/promptsmith/issues)
- 🔗 [Vercel AI SDK](https://sdk.vercel.ai/)

---

<div align="center">
  <strong>Built with ❤️ for the Vercel AI SDK community</strong>
</div>

  ·
  Made by <a href="https://github.com/galfrevn">@galfrevn</a>

  ·
  Hephaestus by parkjisun from <a href="https://thenounproject.com/browse/icons/term/hephaestus/" target="_blank" title="Hephaestus Icons">Noun Project</a> (CC BY 3.0)
</div>
