# PromptSmith Examples

Comprehensive examples demonstrating how to use PromptSmith with different frameworks and use cases.

## 📁 Structure

### [AI SDK Examples](./ai-sdk)
Examples using Vercel AI SDK:
- [Basic Agent](./ai-sdk/01-basic-agent.ts) - Simple text generation
- [Agent with Tools](./ai-sdk/02-agent-with-tools.ts) - Tool integration
- [Streaming Responses](./ai-sdk/03-streaming.ts) - Real-time streaming
- [Customer Support](./ai-sdk/04-customer-support.ts) - Complete e-commerce support agent
- [Data Analysis](./ai-sdk/05-data-analysis.ts) - Multi-tool data analyst
- [Secure Enterprise](./ai-sdk/06-secure-enterprise.ts) - Enterprise agent with guardrails

### [Mastra Examples](./mastra)
Examples using Mastra framework:
- [Basic Agent](./mastra/01-basic-agent.ts) - Simple Mastra agent
- [Agent with Tools](./mastra/02-agent-with-tools.ts) - No tool duplication with `.toMastra()`
- [Structured Output](./mastra/03-structured-output.ts) - Type-safe responses
- [Customer Support](./mastra/04-customer-support.ts) - Full-featured support agent
- [Dynamic Agent](./mastra/05-dynamic-agent.ts) - Role-based agent creation

### [Advanced Examples](./advanced)
Advanced patterns and techniques:
- [Validation](./advanced/01-validation.ts) - Pre-deployment validation
- [Conditional Logic](./advanced/02-conditional-logic.ts) - Dynamic configuration
- [State Introspection](./advanced/03-state-introspection.ts) - Query builder state
- [Debug Mode](./advanced/04-debug-mode.ts) - Development debugging
- [TOON Format](./advanced/05-toon-format.ts) - Token optimization
- [Composability](./advanced/06-composability.ts) - Reusable patterns
- [Testing](./advanced/07-testing.ts) - Automated testing

## 🚀 Running Examples

Each example is a standalone TypeScript file that can be run directly:

```bash
# Install dependencies
npm install promptsmith-ts zod ai @mastra/core

# Run an AI SDK example
npx tsx examples/ai-sdk/01-basic-agent.ts

# Run a Mastra example
npx tsx examples/mastra/01-basic-agent.ts

# Run an advanced example
npx tsx examples/advanced/01-validation.ts
```

## 📚 Learning Path

**New to PromptSmith?** Start here:
1. [Basic Agent](./ai-sdk/01-basic-agent.ts) - Learn the fundamentals
2. [Agent with Tools](./ai-sdk/02-agent-with-tools.ts) - Add tool integration
3. [Validation](./advanced/01-validation.ts) - Catch issues early

**Building production agents?** Check these out:
1. [Customer Support](./ai-sdk/04-customer-support.ts) - Complete real-world example
2. [Secure Enterprise](./ai-sdk/06-secure-enterprise.ts) - Security best practices
3. [TOON Format](./advanced/05-toon-format.ts) - Optimize token usage

**Using Mastra?** Start here:
1. [Basic Agent](./mastra/01-basic-agent.ts) - Mastra fundamentals
2. [Agent with Tools](./mastra/02-agent-with-tools.ts) - Eliminate tool duplication
3. [Customer Support](./mastra/04-customer-support.ts) - Production-ready agent

## 💡 Key Concepts

### Tool Integration
- **AI SDK**: Use `.toAiSdk()` to export both system prompt and tools
- **Mastra**: Use `.toMastra()` to automatically convert tools (no duplication!)

### Validation
All production examples include validation:
```typescript
const validation = builder.validate();
if (!validation.isValid) {
  throw new Error("Invalid configuration");
}
```

### Token Optimization
Use TOON format in production for 30-60% token savings:
```typescript
builder.withFormat("toon");
```

### Security
Enable guardrails for production agents:
```typescript
builder.withGuardrails();
```

## 🤝 Contributing

Have a useful example? Contributions welcome! Please:
1. Follow the existing file naming convention
2. Include inline comments explaining key concepts
3. Add error handling and validation
4. Update this README with a link to your example
