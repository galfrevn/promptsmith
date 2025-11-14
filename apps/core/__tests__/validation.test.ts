import { describe, expect, test } from "bun:test";
import { z } from "zod";
import type { ExecutableToolDefinition } from "../src/types";
import {
  createValidator,
  formatValidationResult,
  PromptValidator,
  type ValidationResult,
  type ValidatorConfig,
} from "../src/validation";

describe("PromptValidator", () => {
  describe("Constructor", () => {
    test("creates validator with default config", () => {
      const validator = new PromptValidator();
      expect(validator).toBeDefined();
    });

    test("creates validator with custom config", () => {
      const config: ValidatorConfig = {
        checkDuplicateTools: false,
        checkIdentity: false,
        checkRecommendations: false,
        checkConstraintConflicts: false,
        checkEmptySections: false,
      };
      const validator = new PromptValidator(config);
      expect(validator).toBeDefined();
    });

    test("uses default true values when config not provided", () => {
      const validator = new PromptValidator({});
      const result = validator.validate({
        identity: "",
        capabilities: [],
        tools: [],
        constraints: [],
        examples: [],
        guardrailsEnabled: false,
        forbiddenTopics: [],
        context: "",
        tone: "",
        outputFormat: "",
        errorHandling: "",
      });

      // Should have warning about missing identity (default checkIdentity: true)
      expect(result.warnings.some((w) => w.code === "MISSING_IDENTITY")).toBe(
        true
      );
    });
  });

  describe("Duplicate tool detection", () => {
    test("detects duplicate tool names", () => {
      const validator = new PromptValidator();
      const tools: ExecutableToolDefinition[] = [
        {
          name: "searchTool",
          description: "Search",
          schema: z.object({ query: z.string() }),
        },
        {
          name: "searchTool",
          description: "Another search",
          schema: z.object({ q: z.string() }),
        },
      ];

      const result = validator.validate({
        identity: "Test",
        capabilities: [],
        tools,
        constraints: [],
        examples: [],
        guardrailsEnabled: false,
        forbiddenTopics: [],
        context: "",
        tone: "",
        outputFormat: "",
        errorHandling: "",
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].code).toBe("DUPLICATE_TOOL");
      expect(result.errors[0].message).toContain("searchTool");
    });

    test("handles multiple duplicate tools", () => {
      const validator = new PromptValidator();
      const tools: ExecutableToolDefinition[] = [
        {
          name: "tool1",
          description: "First",
          schema: z.object({ a: z.string() }),
        },
        {
          name: "tool1",
          description: "Second",
          schema: z.object({ b: z.string() }),
        },
        {
          name: "tool2",
          description: "Third",
          schema: z.object({ c: z.string() }),
        },
        {
          name: "tool2",
          description: "Fourth",
          schema: z.object({ d: z.string() }),
        },
      ];

      const result = validator.validate({
        identity: "Test",
        capabilities: [],
        tools,
        constraints: [],
        examples: [],
        guardrailsEnabled: false,
        forbiddenTopics: [],
        context: "",
        tone: "",
        outputFormat: "",
        errorHandling: "",
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBe(2);
      expect(result.errors.some((e) => e.message.includes("tool1"))).toBe(true);
      expect(result.errors.some((e) => e.message.includes("tool2"))).toBe(true);
    });

    test("passes when no duplicate tools", () => {
      const validator = new PromptValidator();
      const tools: ExecutableToolDefinition[] = [
        {
          name: "tool1",
          description: "First",
          schema: z.object({ a: z.string() }),
        },
        {
          name: "tool2",
          description: "Second",
          schema: z.object({ b: z.string() }),
        },
      ];

      const result = validator.validate({
        identity: "Test",
        capabilities: [],
        tools,
        constraints: [],
        examples: [],
        guardrailsEnabled: false,
        forbiddenTopics: [],
        context: "",
        tone: "",
        outputFormat: "",
        errorHandling: "",
      });

      expect(result.errors.length).toBe(0);
    });

    test("can be disabled via config", () => {
      const validator = new PromptValidator({ checkDuplicateTools: false });
      const tools: ExecutableToolDefinition[] = [
        {
          name: "duplicate",
          description: "First",
          schema: z.object({ a: z.string() }),
        },
        {
          name: "duplicate",
          description: "Second",
          schema: z.object({ b: z.string() }),
        },
      ];

      const result = validator.validate({
        identity: "Test",
        capabilities: [],
        tools,
        constraints: [],
        examples: [],
        guardrailsEnabled: false,
        forbiddenTopics: [],
        context: "",
        tone: "",
        outputFormat: "",
        errorHandling: "",
      });

      expect(result.errors.length).toBe(0);
    });
  });

  describe("Identity validation", () => {
    test("warns when identity is missing", () => {
      const validator = new PromptValidator();
      const result = validator.validate({
        identity: "",
        capabilities: [],
        tools: [],
        constraints: [],
        examples: [],
        guardrailsEnabled: false,
        forbiddenTopics: [],
        context: "",
        tone: "",
        outputFormat: "",
        errorHandling: "",
      });

      expect(result.warnings.some((w) => w.code === "MISSING_IDENTITY")).toBe(
        true
      );
    });

    test("warns when identity is whitespace only", () => {
      const validator = new PromptValidator();
      const result = validator.validate({
        identity: "   \n\t  ",
        capabilities: [],
        tools: [],
        constraints: [],
        examples: [],
        guardrailsEnabled: false,
        forbiddenTopics: [],
        context: "",
        tone: "",
        outputFormat: "",
        errorHandling: "",
      });

      expect(result.warnings.some((w) => w.code === "MISSING_IDENTITY")).toBe(
        true
      );
    });

    test("passes when identity is set", () => {
      const validator = new PromptValidator();
      const result = validator.validate({
        identity: "You are a helpful assistant",
        capabilities: [],
        tools: [],
        constraints: [],
        examples: [],
        guardrailsEnabled: false,
        forbiddenTopics: [],
        context: "",
        tone: "",
        outputFormat: "",
        errorHandling: "",
      });

      expect(result.warnings.some((w) => w.code === "MISSING_IDENTITY")).toBe(
        false
      );
    });

    test("can be disabled via config", () => {
      const validator = new PromptValidator({ checkIdentity: false });
      const result = validator.validate({
        identity: "",
        capabilities: [],
        tools: [],
        constraints: [],
        examples: [],
        guardrailsEnabled: false,
        forbiddenTopics: [],
        context: "",
        tone: "",
        outputFormat: "",
        errorHandling: "",
      });

      expect(result.warnings.some((w) => w.code === "MISSING_IDENTITY")).toBe(
        false
      );
    });
  });

  describe("Empty sections validation", () => {
    test("warns about empty capabilities", () => {
      const validator = new PromptValidator();
      const result = validator.validate({
        identity: "Test",
        capabilities: [],
        tools: [],
        constraints: [],
        examples: [],
        guardrailsEnabled: false,
        forbiddenTopics: [],
        context: "",
        tone: "",
        outputFormat: "",
        errorHandling: "",
      });

      expect(result.warnings.some((w) => w.code === "EMPTY_CAPABILITIES")).toBe(
        true
      );
    });

    test("warns about empty constraints", () => {
      const validator = new PromptValidator();
      const result = validator.validate({
        identity: "Test",
        capabilities: ["cap"],
        tools: [],
        constraints: [],
        examples: [],
        guardrailsEnabled: false,
        forbiddenTopics: [],
        context: "",
        tone: "",
        outputFormat: "",
        errorHandling: "",
      });

      expect(result.warnings.some((w) => w.code === "EMPTY_CONSTRAINTS")).toBe(
        true
      );
    });

    test("passes when capabilities and constraints exist", () => {
      const validator = new PromptValidator();
      const result = validator.validate({
        identity: "Test",
        capabilities: ["cap"],
        tools: [],
        constraints: [{ type: "must", rule: "Be helpful" }],
        examples: [],
        guardrailsEnabled: false,
        forbiddenTopics: [],
        context: "",
        tone: "",
        outputFormat: "",
        errorHandling: "",
      });

      expect(
        result.warnings.some(
          (w) =>
            w.code === "EMPTY_CAPABILITIES" || w.code === "EMPTY_CONSTRAINTS"
        )
      ).toBe(false);
    });

    test("can be disabled via config", () => {
      const validator = new PromptValidator({ checkEmptySections: false });
      const result = validator.validate({
        identity: "Test",
        capabilities: [],
        tools: [],
        constraints: [],
        examples: [],
        guardrailsEnabled: false,
        forbiddenTopics: [],
        context: "",
        tone: "",
        outputFormat: "",
        errorHandling: "",
      });

      expect(
        result.warnings.some(
          (w) =>
            w.code === "EMPTY_CAPABILITIES" || w.code === "EMPTY_CONSTRAINTS"
        )
      ).toBe(false);
    });
  });

  describe("Recommendations validation", () => {
    test("suggests adding examples when tools exist but no examples", () => {
      const validator = new PromptValidator();
      const result = validator.validate({
        identity: "Test",
        capabilities: ["cap"],
        tools: [
          {
            name: "tool",
            description: "Tool",
            schema: z.object({ a: z.string() }),
          },
        ],
        constraints: [],
        examples: [],
        guardrailsEnabled: false,
        forbiddenTopics: [],
        context: "context",
        tone: "",
        outputFormat: "",
        errorHandling: "",
      });

      expect(result.info.some((i) => i.code === "TOOLS_WITHOUT_EXAMPLES")).toBe(
        true
      );
    });

    test("suggests adding guardrails when tools exist but no guardrails", () => {
      const validator = new PromptValidator();
      const result = validator.validate({
        identity: "Test",
        capabilities: ["cap"],
        tools: [
          {
            name: "tool",
            description: "Tool",
            schema: z.object({ a: z.string() }),
          },
        ],
        constraints: [],
        examples: [],
        guardrailsEnabled: false,
        forbiddenTopics: [],
        context: "context",
        tone: "",
        outputFormat: "",
        errorHandling: "",
      });

      expect(
        result.info.some((i) => i.code === "TOOLS_WITHOUT_GUARDRAILS")
      ).toBe(true);
    });

    test("suggests adding must constraints when constraints exist but no must", () => {
      const validator = new PromptValidator();
      const result = validator.validate({
        identity: "Test",
        capabilities: ["cap"],
        tools: [],
        constraints: [{ type: "should", rule: "Be helpful" }],
        examples: [],
        guardrailsEnabled: false,
        forbiddenTopics: [],
        context: "context",
        tone: "",
        outputFormat: "",
        errorHandling: "",
      });

      expect(result.info.some((i) => i.code === "NO_MUST_CONSTRAINTS")).toBe(
        true
      );
    });

    test("can be disabled via config", () => {
      const validator = new PromptValidator({ checkRecommendations: false });
      const result = validator.validate({
        identity: "Test",
        capabilities: ["cap"],
        tools: [
          {
            name: "tool",
            description: "Tool",
            schema: z.object({ a: z.string() }),
          },
        ],
        constraints: [{ type: "should", rule: "Be helpful" }],
        examples: [],
        guardrailsEnabled: false,
        forbiddenTopics: [],
        context: "context",
        tone: "",
        outputFormat: "",
        errorHandling: "",
      });

      expect(result.info.length).toBe(0);
    });
  });

  describe("Constraint conflicts validation", () => {
    test("warns about conflicting constraints with 'never' pattern", () => {
      const validator = new PromptValidator();
      const result = validator.validate({
        identity: "Test",
        capabilities: [],
        tools: [],
        constraints: [
          { type: "must", rule: "neververify identity" },
          { type: "must_not", rule: "verify identity" },
        ],
        examples: [],
        guardrailsEnabled: false,
        forbiddenTopics: [],
        context: "",
        tone: "",
        outputFormat: "",
        errorHandling: "",
      });

      expect(
        result.warnings.some((w) => w.code === "CONFLICTING_CONSTRAINTS")
      ).toBe(true);
    });

    test("passes when no conflicts using 'never' pattern", () => {
      const validator = new PromptValidator();
      const result = validator.validate({
        identity: "Test",
        capabilities: [],
        tools: [],
        constraints: [
          { type: "must", rule: "verify user identity" },
          { type: "must_not", rule: "store sensitive data" },
          { type: "should", rule: "be concise" },
          { type: "should_not", rule: "use technical jargon" },
        ],
        examples: [],
        guardrailsEnabled: false,
        forbiddenTopics: [],
        context: "",
        tone: "",
        outputFormat: "",
        errorHandling: "",
      });

      expect(
        result.warnings.some((w) => w.code === "CONFLICTING_CONSTRAINTS")
      ).toBe(false);
    });

    test("passes when must contains 'never' but no matching must_not", () => {
      const validator = new PromptValidator();
      const result = validator.validate({
        identity: "Test",
        capabilities: [],
        tools: [],
        constraints: [
          { type: "must", rule: "never store passwords" },
          { type: "must_not", rule: "expose API keys" },
        ],
        examples: [],
        guardrailsEnabled: false,
        forbiddenTopics: [],
        context: "",
        tone: "",
        outputFormat: "",
        errorHandling: "",
      });

      expect(
        result.warnings.some((w) => w.code === "CONFLICTING_CONSTRAINTS")
      ).toBe(false);
    });

    test("can be disabled via config", () => {
      const validator = new PromptValidator({
        checkConstraintConflicts: false,
      });
      const result = validator.validate({
        identity: "Test",
        capabilities: [],
        tools: [],
        constraints: [
          { type: "must", rule: "never verify identity" },
          { type: "must_not", rule: "verify identity" },
        ],
        examples: [],
        guardrailsEnabled: false,
        forbiddenTopics: [],
        context: "",
        tone: "",
        outputFormat: "",
        errorHandling: "",
      });

      expect(
        result.warnings.some((w) => w.code === "CONFLICTING_CONSTRAINTS")
      ).toBe(false);
    });
  });

  describe("Complete validation result", () => {
    test("valid configuration passes all checks", () => {
      const validator = new PromptValidator();
      const result = validator.validate({
        identity: "You are a helpful assistant",
        capabilities: ["Answer questions", "Provide examples"],
        tools: [
          {
            name: "search",
            description: "Search tool",
            schema: z.object({ query: z.string() }),
          },
        ],
        constraints: [{ type: "must", rule: "Be helpful" }],
        examples: [{ user: "Hello", assistant: "Hi there!" }],
        guardrailsEnabled: true,
        forbiddenTopics: ["Medical advice"],
        context: "Customer service context",
        tone: "Friendly and professional",
        outputFormat: "Markdown",
        errorHandling: "Apologize and suggest alternatives",
      });

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    test("returns all issue types separately", () => {
      const validator = new PromptValidator();
      const result = validator.validate({
        identity: "",
        capabilities: [],
        tools: [
          {
            name: "tool",
            description: "Tool",
            schema: z.object({ a: z.string() }),
          },
          {
            name: "tool",
            description: "Duplicate",
            schema: z.object({ b: z.string() }),
          },
        ],
        constraints: [],
        examples: [],
        guardrailsEnabled: false,
        forbiddenTopics: [],
        context: "",
        tone: "",
        outputFormat: "",
        errorHandling: "",
      });

      expect(result.errors.length).toBeGreaterThan(0); // Duplicate tool
      expect(result.warnings.length).toBeGreaterThan(0); // Missing identity, empty sections
      expect(result.info.length).toBeGreaterThan(0); // Recommendations
      expect(result.valid).toBe(false); // Has errors
    });
  });
});

describe("createValidator()", () => {
  test("creates validator with no config", () => {
    const validator = createValidator();
    expect(validator).toBeDefined();
  });

  test("creates validator with config", () => {
    const config: ValidatorConfig = {
      checkDuplicateTools: false,
    };
    const validator = createValidator(config);
    expect(validator).toBeDefined();
  });
});

describe("formatValidationResult()", () => {
  test("formats valid result", () => {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      info: [],
    };

    const formatted = formatValidationResult(result);
    expect(formatted).toContain("✓");
    expect(formatted).toContain("passed");
  });

  test("formats result with errors", () => {
    const result: ValidationResult = {
      valid: false,
      errors: [
        {
          severity: "error",
          code: "TEST_ERROR",
          message: "Test error message",
          suggestion: "Fix this error",
        },
      ],
      warnings: [],
      info: [],
    };

    const formatted = formatValidationResult(result);
    expect(formatted).toContain("✗");
    expect(formatted).toContain("failed");
    expect(formatted).toContain("Errors");
    expect(formatted).toContain("TEST_ERROR");
    expect(formatted).toContain("Test error message");
    expect(formatted).toContain("Fix this error");
  });

  test("formats result with warnings", () => {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [
        {
          severity: "warning",
          code: "TEST_WARNING",
          message: "Test warning message",
        },
      ],
      info: [],
    };

    const formatted = formatValidationResult(result);
    expect(formatted).toContain("Warnings");
    expect(formatted).toContain("TEST_WARNING");
    expect(formatted).toContain("Test warning message");
  });

  test("formats result with info", () => {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      info: [
        {
          severity: "info",
          code: "TEST_INFO",
          message: "Test info message",
        },
      ],
    };

    const formatted = formatValidationResult(result);
    expect(formatted).toContain("Info");
    expect(formatted).toContain("TEST_INFO");
    expect(formatted).toContain("Test info message");
  });

  test("formats result with multiple issues", () => {
    const result: ValidationResult = {
      valid: false,
      errors: [
        {
          severity: "error",
          code: "ERROR1",
          message: "Error 1",
        },
        {
          severity: "error",
          code: "ERROR2",
          message: "Error 2",
        },
      ],
      warnings: [
        {
          severity: "warning",
          code: "WARN1",
          message: "Warning 1",
        },
      ],
      info: [
        {
          severity: "info",
          code: "INFO1",
          message: "Info 1",
        },
      ],
    };

    const formatted = formatValidationResult(result);
    expect(formatted).toContain("ERROR1");
    expect(formatted).toContain("ERROR2");
    expect(formatted).toContain("WARN1");
    expect(formatted).toContain("INFO1");
  });

  test("handles issues without suggestions", () => {
    const result: ValidationResult = {
      valid: false,
      errors: [
        {
          severity: "error",
          code: "TEST",
          message: "Test message",
          // No suggestion provided
        },
      ],
      warnings: [],
      info: [],
    };

    const formatted = formatValidationResult(result);
    expect(formatted).toContain("TEST");
    expect(formatted).toContain("Test message");
  });
});
