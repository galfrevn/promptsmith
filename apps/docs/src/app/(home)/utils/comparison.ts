export const before = {
  title: "Before",
  code: `// String concatenation nightmare

import { z } from "zod";

const systemPrompt = 
  "You are a " + role + ". " +
  "Context: " + context + ". " +
  "Rules: " + rules.join(", ") + ". " +

// No type safety. No validation.
// Hard to maintain and debug.
`,
  desadvantages: [
    { id: 1, text: "No type safety or validation" },
    { id: 2, text: "Vulnerable to prompt injection" },
    { id: 3, text: "Painful to scale or debug" },
  ],
};

export const after = {
  title: "With PromptSmith",
  code: `// Clean, typed, production-ready

import { prompt } from "promptsmith-ts/builder";

const systemPrompt = prompt()
  .withIdentity(role)
  .addContext(context)
  .withGuardrails() // built-in security
  .build();

// Fully validated. Fluent. Reusable.
`,
  advantages: [
    { id: 1, text: "Fully type-safe with Zod validation" },
    { id: 2, text: "Built-in guardrails against injection" },
    { id: 3, text: "Composable, testable, production-grade" },
  ],
};
