/** biome-ignore-all lint/style/noMagicNumbers: Magic number is acceptable for this test */
/** biome-ignore-all lint/performance/useTopLevelRegex: Performance is not a concern for this test */

import { describe, expect, test } from "bun:test";

import { z } from "zod";
import { createPromptBuilder } from "@/builder";

describe("TOON Format Optimization", () => {
  describe("Array Notation", () => {
    test("capabilities use array notation with count", () => {
      const prompt = createPromptBuilder()
        .withCapability("Answer questions")
        .withCapability("Provide help")
        .withCapability("Assist users")
        .withFormat("toon")
        .build();

      expect(prompt).toContain("Capabilities[3]:");
      expect(prompt).toContain("Answer questions");
      expect(prompt).toContain("Provide help");
      expect(prompt).toContain("Assist users");
    });

    test("tools use array notation with count", () => {
      const prompt = createPromptBuilder()
        .withTool({
          name: "search",
          description: "Search the web",
          schema: z.object({ query: z.string() }),
        })
        .withTool({
          name: "calculate",
          description: "Perform calculations",
          schema: z.object({ expression: z.string() }),
        })
        .withFormat("toon")
        .build();

      expect(prompt).toContain("Tools[2]:");
      expect(prompt).toContain("search:");
      expect(prompt).toContain("calculate:");
    });

    test("constraints grouped with array notation", () => {
      const prompt = createPromptBuilder()
        .withConstraint("must", "Always be polite")
        .withConstraint("must", "Verify information")
        .withConstraint("must_not", "Share personal data")
        .withFormat("toon")
        .build();

      expect(prompt).toContain("MUST[2]:");
      expect(prompt).toContain("MUST_NOT[1]:");
      expect(prompt).toContain("Always be polite");
      expect(prompt).toContain("Verify information");
      expect(prompt).toContain("Share personal data");
    });

    test("forbidden topics use array notation", () => {
      const prompt = createPromptBuilder()
        .withForbiddenTopics(["Politics", "Religion", "Medical advice"])
        .withFormat("toon")
        .build();

      expect(prompt).toContain("ForbiddenTopics[3]:");
      expect(prompt).toContain("Politics");
      expect(prompt).toContain("Religion");
      expect(prompt).toContain("Medical advice");
    });
  });

  describe("Indentation Structure", () => {
    test("sections use indentation instead of headers", () => {
      const prompt = createPromptBuilder()
        .withIdentity("You are a helpful assistant")
        .withCapability("Answer questions")
        .withFormat("toon")
        .build();

      // Should not have markdown headers
      expect(prompt).not.toContain("# Identity");
      expect(prompt).not.toContain("# Capabilities");

      // Should have TOON format
      expect(prompt).toContain("Identity:");
      expect(prompt).toContain("Capabilities[1]:");

      // Should have proper indentation
      expect(prompt).toContain("Identity:\n  You are a helpful assistant");
    });

    test("multi-line sections maintain indentation", () => {
      const prompt = createPromptBuilder()
        .withContext("Line 1\nLine 2\nLine 3")
        .withFormat("toon")
        .build();

      expect(prompt).toContain("Context:");
      expect(prompt).toContain("  Line 1");
      expect(prompt).toContain("  Line 2");
      expect(prompt).toContain("  Line 3");
    });

    test("tool parameters are indented", () => {
      const prompt = createPromptBuilder()
        .withTool({
          name: "search",
          description: "Search the web",
          schema: z.object({
            query: z.string().describe("The search query"),
          }),
        })
        .withFormat("toon")
        .build();

      expect(prompt).toContain("  search:");
      expect(prompt).toContain("    Search the web");
      expect(prompt).toContain("    Parameters:");
      expect(prompt).toContain(
        "      query(string,required): The search query"
      );
    });
  });

  describe("Parameter Format Conversion", () => {
    test("converts markdown parameters to TOON format", () => {
      const prompt = createPromptBuilder()
        .withTool({
          name: "calculate",
          description: "Perform calculation",
          schema: z.object({
            expression: z.string().describe("Math expression"),
            precision: z.number().optional().describe("Decimal precision"),
          }),
        })
        .withFormat("toon")
        .build();

      // Should not have markdown backticks or bullets
      expect(prompt).not.toContain("`expression`");
      expect(prompt).not.toContain("- `");

      // Should have TOON format: name(type,required): description
      expect(prompt).toContain("expression(string,required): Math expression");
      expect(prompt).toContain("precision(number,optional): Decimal precision");
    });

    test("handles complex nested schemas", () => {
      const prompt = createPromptBuilder()
        .withTool({
          name: "createUser",
          description: "Create a new user",
          schema: z.object({
            name: z.string().describe("User name"),
            age: z.number().describe("User age"),
            email: z.string().email().describe("Email address"),
          }),
        })
        .withFormat("toon")
        .build();

      expect(prompt).toContain("name(string,required): User name");
      expect(prompt).toContain("age(number,required): User age");
      expect(prompt).toContain("email(string,required): Email address");
    });
  });

  describe("Tabular Examples Optimization", () => {
    test("multiple examples with same structure use tabular format", () => {
      const prompt = createPromptBuilder()
        .withExamples([
          {
            user: "Hello",
            assistant: "Hi there!",
            explanation: "Greeting response",
          },
          {
            user: "Help me",
            assistant: "How can I help?",
            explanation: "Offer to assist",
          },
          {
            user: "Thanks",
            assistant: "You're welcome!",
            explanation: "Acknowledgment",
          },
        ])
        .withFormat("toon")
        .build();

      // Should use tabular format with field declaration
      expect(prompt).toContain("Examples[3]{user,assistant,explanation}:");

      // Should have CSV-like rows
      expect(prompt).toContain('"Hello","Hi there!","Greeting response"');
      expect(prompt).toContain('"Help me","How can I help?","Offer to assist"');
      expect(prompt).toContain('"Thanks","You\'re welcome!","Acknowledgment"');
    });

    test("single example uses standard format", () => {
      const prompt = createPromptBuilder()
        .withExamples([
          {
            user: "Hello",
            assistant: "Hi there!",
            explanation: "Greeting",
          },
        ])
        .withFormat("toon")
        .build();

      // Should not use tabular format for single example
      expect(prompt).not.toContain("{user,assistant,explanation}:");

      // Should use standard format
      expect(prompt).toContain("Examples[1]:");
      expect(prompt).toContain("User: Hello");
      expect(prompt).toContain("Assistant: Hi there!");
    });

    test("examples with varying structures use standard format", () => {
      const prompt = createPromptBuilder()
        .withExamples([
          {
            user: "Hello",
            assistant: "Hi there!",
            explanation: "Greeting",
          },
          {
            input: "Calculate 2+2",
            output: "4",
          },
        ])
        .withFormat("toon")
        .build();

      // Should not use tabular format for varying structures
      expect(prompt).not.toContain("{user,assistant");

      // Should use standard format
      expect(prompt).toContain("Examples[2]:");
      expect(prompt).toContain("Example 1:");
      expect(prompt).toContain("Example 2:");
    });
  });

  describe("Constraint Grouping", () => {
    test("constraints are grouped by type with counts", () => {
      const prompt = createPromptBuilder()
        .withConstraint("must", "Be accurate")
        .withConstraint("must", "Be helpful")
        .withConstraint("must_not", "Share secrets")
        .withConstraint("should", "Be concise")
        .withConstraint("should_not", "Use jargon")
        .withFormat("toon")
        .build();

      expect(prompt).toContain("Constraints:");
      expect(prompt).toContain("MUST[2]:");
      expect(prompt).toContain("MUST_NOT[1]:");
      expect(prompt).toContain("SHOULD[1]:");
      expect(prompt).toContain("SHOULD_NOT[1]:");
    });
  });

  describe("Guardrails Optimization", () => {
    test("guardrails use compact hierarchical format", () => {
      const prompt = createPromptBuilder()
        .withGuardrails()
        .withFormat("toon")
        .build();

      expect(prompt).toContain("Guardrails:");
      expect(prompt).toContain("InputIsolation:");
      expect(prompt).toContain("RoleProtection:");
      expect(prompt).toContain("InstructionSeparation:");
      expect(prompt).toContain("OutputSafety:");

      // Should not have markdown bullets or excessive formatting
      expect(prompt).not.toContain("- ");
      expect(prompt).not.toContain("## ");
    });
  });

  describe("Token Count Comparison", () => {
    test("TOON format structure differs from markdown", () => {
      const builder = createPromptBuilder()
        .withIdentity("You are a helpful assistant")
        .withCapability("Answer questions")
        .withCapability("Provide information")
        .withCapability("Help users");

      const markdown = builder.extend().withFormat("markdown").build();
      const toon = builder.extend().withFormat("toon").build();

      // Both contain the same information
      expect(toon).toContain("helpful assistant");
      expect(markdown).toContain("helpful assistant");

      // TOON uses different structure
      expect(toon).toContain("Capabilities[3]:");
      expect(markdown).toContain("# Capabilities");
      expect(markdown).toContain("1. Answer questions");
      expect(toon).not.toContain("1. Answer questions");
    });

    test("complex prompt with tools uses TOON format correctly", () => {
      const builder = createPromptBuilder()
        .withIdentity("You are a customer service agent")
        .withCapability("Answer questions")
        .withCapability("Process requests")
        .withTool({
          name: "searchKnowledgeBase",
          description: "Search the knowledge base",
          schema: z.object({
            query: z.string().describe("Search query"),
            category: z.string().optional().describe("Category filter"),
          }),
        })
        .withTool({
          name: "createTicket",
          description: "Create support ticket",
          schema: z.object({
            title: z.string().describe("Ticket title"),
            description: z.string().describe("Detailed description"),
            priority: z
              .enum(["low", "medium", "high"])
              .describe("Priority level"),
          }),
        })
        .withConstraint("must", "Always be polite")
        .withConstraint("must", "Verify information")
        .withConstraint("must_not", "Share sensitive data");

      const markdown = builder.extend().withFormat("markdown").build();
      const toon = builder.extend().withFormat("toon").build();

      // TOON should use compact parameter format
      expect(toon).toContain("query(string,required)");
      expect(toon).toContain("category(string,optional)");

      // Markdown should use markdown format
      expect(markdown).toContain("`query`");
      expect(markdown).toContain("`category`");

      // TOON should use array notation
      expect(toon).toContain("Tools[2]:");
      expect(toon).toContain("Capabilities[2]:");
    });

    test("prompt with examples and guardrails uses TOON format", () => {
      const builder = createPromptBuilder()
        .withIdentity("You are an AI assistant")
        .withCapability("Help users")
        .withExamples([
          { user: "Hello", assistant: "Hi!", explanation: "Greeting" },
          { user: "Help", assistant: "Sure!", explanation: "Offer help" },
          { user: "Thanks", assistant: "Welcome!", explanation: "Acknowledge" },
        ])
        .withGuardrails()
        .withConstraint("must", "Be helpful")
        .withConstraint("must_not", "Be rude");

      const markdown = builder.extend().withFormat("markdown").build();
      const toon = builder.extend().withFormat("toon").build();

      // Both should contain the same information
      expect(toon).toContain("AI assistant");
      expect(toon).toContain("Hello");
      expect(toon).toContain("Guardrails");

      expect(markdown).toContain("AI assistant");
      expect(markdown).toContain("Hello");
      expect(markdown).toContain("Security Guardrails");

      // TOON should use tabular format for examples
      expect(toon).toContain("Examples[3]{user,assistant,explanation}:");
      expect(toon).toContain('"Hello","Hi!","Greeting"');

      // Markdown should use standard format
      expect(markdown).toContain("## Example 1");
    });

    test("compact format maintains markdown structure", () => {
      const builder = createPromptBuilder()
        .withIdentity("You are a helpful assistant")
        .withCapability("Answer questions")
        .withCapability("Provide help");

      const compact = builder.extend().withFormat("compact").build();

      // Compact should not have excessive newlines
      expect(compact).not.toMatch(/\n{3,}/);

      // Compact should still use markdown headers
      expect(compact).toContain("# Identity");
      expect(compact).toContain("# Capabilities");

      // Should not have extra spaces
      expect(compact).not.toMatch(/ {2,}/); // No double spaces
    });
  });

  describe("Format Consistency", () => {
    test("all sections use consistent TOON formatting", () => {
      const prompt = createPromptBuilder()
        .withIdentity("You are an assistant")
        .withContext("Important context")
        .withCapability("Help users")
        .withTone("Professional and friendly")
        .withOutput("JSON format")
        .withFormat("toon")
        .build();

      // All sections should end with colon
      expect(prompt).toContain("Identity:");
      expect(prompt).toContain("Context:");
      expect(prompt).toContain("Capabilities[1]:");
      expect(prompt).toContain("Tone:");
      expect(prompt).toContain("OutputFormat:");

      // No markdown headers
      expect(prompt).not.toContain("#");
    });

    test("TOON output is valid and parseable", () => {
      const prompt = createPromptBuilder()
        .withIdentity("Test assistant")
        .withCapability("Test capability")
        .withFormat("toon")
        .build();

      // Should be non-empty
      expect(prompt.length).toBeGreaterThan(0);

      // Should have proper structure
      expect(prompt).toMatch(/Identity:\s+Test assistant/);
      expect(prompt).toMatch(/Capabilities\[1\]:\s+Test capability/);
    });
  });
});
