import type { Constraint, Example, ExecutableToolDefinition } from "./types";

/**
 * Severity level for validation issues
 */
export type ValidationSeverity = "error" | "warning" | "info";

/**
 * A validation issue found in the builder configuration
 */
export type ValidationIssue = {
  severity: ValidationSeverity;
  code: string;
  message: string;
  suggestion?: string;
};

/**
 * Result of a validation check
 */
export type ValidationResult = {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  info: ValidationIssue[];
};

/**
 * Configuration for the validator
 */
export type ValidatorConfig = {
  /**
   * Whether to check for duplicate tool names (default: true)
   */
  checkDuplicateTools?: boolean;

  /**
   * Whether to check for missing identity (default: true)
   */
  checkIdentity?: boolean;

  /**
   * Whether to check for recommended sections (default: true)
   */
  checkRecommendations?: boolean;

  /**
   * Whether to check for conflicting constraints (default: true)
   */
  checkConstraintConflicts?: boolean;

  /**
   * Whether to check for empty sections (default: true)
   */
  checkEmptySections?: boolean;
};

/**
 * Validates builder configuration and provides helpful error messages.
 */
export class PromptValidator {
  private readonly config: Required<ValidatorConfig>;

  constructor(config: ValidatorConfig = {}) {
    this.config = {
      checkDuplicateTools: config.checkDuplicateTools ?? true,
      checkIdentity: config.checkIdentity ?? true,
      checkRecommendations: config.checkRecommendations ?? true,
      checkConstraintConflicts: config.checkConstraintConflicts ?? true,
      checkEmptySections: config.checkEmptySections ?? true,
    };
  }

  /**
   * Validates the builder state
   */
  validate(state: {
    identity: string;
    capabilities: string[];
    tools: ExecutableToolDefinition[];
    constraints: Constraint[];
    examples: Example[];
    guardrailsEnabled: boolean;
    forbiddenTopics: string[];
    context: string;
    tone: string;
    outputFormat: string;
    errorHandling: string;
  }): ValidationResult {
    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];
    const info: ValidationIssue[] = [];

    // Check for duplicate tool names
    if (this.config.checkDuplicateTools) {
      this.checkDuplicateTools(state.tools, errors);
    }

    // Check for identity
    if (this.config.checkIdentity) {
      this.checkIdentity(state.identity, warnings);
    }

    // Check for empty sections
    if (this.config.checkEmptySections) {
      this.checkEmptySections(state, warnings);
    }

    // Check recommendations
    if (this.config.checkRecommendations) {
      this.checkRecommendations(state, info);
    }

    // Check constraint conflicts
    if (this.config.checkConstraintConflicts) {
      this.checkConstraintConflicts(state.constraints, warnings);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      info,
    };
  }

  /**
   * Checks for duplicate tool names
   */
  private checkDuplicateTools(
    tools: ExecutableToolDefinition[],
    errors: ValidationIssue[]
  ): void {
    const seen = new Set<string>();
    const duplicates = new Set<string>();

    for (const tool of tools) {
      if (seen.has(tool.name)) {
        duplicates.add(tool.name);
      }
      seen.add(tool.name);
    }

    for (const name of duplicates) {
      errors.push({
        severity: "error",
        code: "DUPLICATE_TOOL",
        message: `Duplicate tool name: "${name}"`,
        suggestion: `Tool names must be unique. Rename one of the "${name}" tools.`,
      });
    }
  }

  /**
   * Checks if identity is set
   */
  private checkIdentity(identity: string, warnings: ValidationIssue[]): void {
    if (!identity || identity.trim().length === 0) {
      warnings.push({
        severity: "warning",
        code: "MISSING_IDENTITY",
        message: "No identity set",
        suggestion:
          "Add an identity with .withIdentity() to define the agent's role",
      });
    }
  }

  /**
   * Checks for empty sections that might indicate incomplete configuration
   */
  private checkEmptySections(
    state: {
      capabilities: string[];
      tools: ExecutableToolDefinition[];
      constraints: Constraint[];
    },
    warnings: ValidationIssue[]
  ): void {
    if (state.capabilities.length === 0) {
      warnings.push({
        severity: "warning",
        code: "EMPTY_CAPABILITIES",
        message: "No capabilities defined",
        suggestion:
          "Add capabilities with .withCapability() or .withCapabilities() to describe what the agent can do",
      });
    }

    if (state.constraints.length === 0) {
      warnings.push({
        severity: "warning",
        code: "EMPTY_CONSTRAINTS",
        message: "No behavioral constraints defined",
        suggestion:
          "Add constraints with .withConstraint() to define behavioral guidelines",
      });
    }
  }

  /**
   * Checks for recommended best practices
   */
  private checkRecommendations(
    state: {
      tools: ExecutableToolDefinition[];
      examples: Example[];
      guardrailsEnabled: boolean;
      constraints: Constraint[];
    },
    info: ValidationIssue[]
  ): void {
    // Check if tools exist but no examples
    if (state.tools.length > 0 && state.examples.length === 0) {
      info.push({
        severity: "info",
        code: "TOOLS_WITHOUT_EXAMPLES",
        message: "Tools defined without usage examples",
        suggestion:
          "Add examples with .withExamples() to demonstrate proper tool usage",
      });
    }

    // Check if tools exist but no guardrails
    if (state.tools.length > 0 && !state.guardrailsEnabled) {
      info.push({
        severity: "info",
        code: "TOOLS_WITHOUT_GUARDRAILS",
        message: "Tools defined without security guardrails",
        suggestion:
          "Enable guardrails with .withGuardrails() to protect against prompt injection",
      });
    }

    // Check if constraints exist but no "must" constraints
    if (state.constraints.length > 0) {
      const hasMust = state.constraints.some((c) => c.type === "must");
      if (!hasMust) {
        info.push({
          severity: "info",
          code: "NO_MUST_CONSTRAINTS",
          message: 'No "must" constraints defined',
          suggestion:
            'Add critical requirements with .withConstraint("must", "...") for essential behavioral rules',
        });
      }
    }
  }

  /**
   * Checks for conflicting constraints
   */
  private checkConstraintConflicts(
    constraints: Constraint[],
    warnings: ValidationIssue[]
  ): void {
    // Check for must/must_not conflicts (simplified - checks for exact opposites)
    const musts = constraints
      .filter((c) => c.type === "must")
      .map((c) => c.rule.toLowerCase());
    const mustNots = constraints
      .filter((c) => c.type === "must_not")
      .map((c) => c.rule.toLowerCase());

    for (const must of musts) {
      for (const mustNot of mustNots) {
        // Simple check: if one contains the negation of the other
        if (
          must.includes("never") &&
          mustNot.includes(must.replace("never", ""))
        ) {
          warnings.push({
            severity: "warning",
            code: "CONFLICTING_CONSTRAINTS",
            message: "Potentially conflicting constraints detected",
            suggestion:
              "Review your must/must_not constraints to ensure they don't contradict each other",
          });
          break;
        }
      }
    }
  }
}

/**
 * Creates a validator with default configuration
 */
export function createValidator(config?: ValidatorConfig): PromptValidator {
  return new PromptValidator(config);
}

/**
 * Formats validation results as a human-readable string
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Formatting output requires detailed inspection
export function formatValidationResult(result: ValidationResult): string {
  const lines: string[] = [];

  if (result.valid) {
    lines.push("✓ Validation passed");
  } else {
    lines.push("✗ Validation failed");
  }

  if (result.errors.length > 0) {
    lines.push("");
    lines.push(`Errors (${result.errors.length}):`);
    for (const error of result.errors) {
      lines.push(`  ✗ [${error.code}] ${error.message}`);
      if (error.suggestion) {
        lines.push(`    → ${error.suggestion}`);
      }
    }
  }

  if (result.warnings.length > 0) {
    lines.push("");
    lines.push(`Warnings (${result.warnings.length}):`);
    for (const warning of result.warnings) {
      lines.push(`  ⚠ [${warning.code}] ${warning.message}`);
      if (warning.suggestion) {
        lines.push(`    → ${warning.suggestion}`);
      }
    }
  }

  if (result.info.length > 0) {
    lines.push("");
    lines.push(`Info (${result.info.length}):`);
    for (const item of result.info) {
      lines.push(`  ℹ [${item.code}] ${item.message}`);
      if (item.suggestion) {
        lines.push(`    → ${item.suggestion}`);
      }
    }
  }

  return lines.join("\n");
}
