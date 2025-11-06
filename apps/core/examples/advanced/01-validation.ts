/**
 * Validation Example
 *
 * This example demonstrates PromptSmith's built-in validation system
 * to catch configuration issues before deployment.
 *
 * Key concepts:
 * - Pre-deployment validation
 * - Validation errors, warnings, and recommendations
 * - Custom validation configuration
 * - Formatted validation output
 */

import {
  createPromptBuilder,
  formatValidationResult,
} from "promptsmith-ts/builder";
import { z } from "zod";

function main() {
  console.log("=== Example 1: Valid Configuration ===\n");

  const validAgent = createPromptBuilder()
    .withIdentity("Customer support agent")
    .withCapabilities(["Answer questions", "Process returns"])
    .withTool({
      name: "search-products",
      description: "Search product catalog",
      schema: z.object({ query: z.string() }),
    })
    .withConstraint("must", "Always verify order numbers")
    .withGuardrails();

  const validResult = validAgent.validate();

  if (validResult.isValid) {
    console.log("✅ Agent configuration is valid!");
  }

  console.log(`Errors: ${validResult.errors.length}`);
  console.log(`Warnings: ${validResult.warnings.length}`);
  console.log(`Recommendations: ${validResult.info.length}\n`);

  // ---

  console.log("=== Example 2: Invalid Configuration ===\n");

  const invalidAgent = createPromptBuilder()
    // Missing identity
    .withTool({
      name: "search-products",
      description: "Search",
      schema: z.object({ query: z.string() }),
    })
    .withTool({
      // Duplicate tool name!
      name: "search-products",
      description: "Search",
      schema: z.object({ query: z.string() }),
    });

  const invalidResult = invalidAgent.validate();

  if (!invalidResult.isValid) {
    console.log("❌ Agent configuration is invalid!\n");
    console.log(formatValidationResult(invalidResult));
  }

  // ---

  console.log("\n=== Example 3: Custom Validation Config ===\n");

  const customAgent = createPromptBuilder()
    .withIdentity("Test agent")
    .withValidatorConfig({
      checkDuplicateTools: true,
      checkMissingIdentity: true,
      checkEmptySections: false, // Don't warn about empty sections
      checkRecommendations: true,
    });

  // This will use the custom configuration
  const customResult = customAgent.validate();

  console.log("Using custom validation configuration:");
  console.log(
    `- checkEmptySections: ${customAgent["_validatorConfig"]?.checkEmptySections ?? true}`
  );
  console.log(`Warnings: ${customResult.warnings.length}`);

  // ---

  console.log("\n=== Example 4: Production Validation Pattern ===\n");

  const productionAgent = createPromptBuilder()
    .withIdentity("Production agent")
    .withCapabilities(["Process orders"])
    .withGuardrails()
    .withFormat("toon"); // Use TOON for production

  const productionResult = productionAgent.validate();

  if (!productionResult.isValid) {
    // Hard fail on errors
    throw new Error(
      `Validation failed: ${productionResult.errors.map((e) => e.message).join(", ")}`
    );
  }

  if (productionResult.warnings.length > 0) {
    // Log warnings but continue
    console.warn("⚠️  Validation warnings:");
    for (const warning of productionResult.warnings) {
      console.warn(`  - ${warning.message}`);
    }
  }

  console.log("\n✅ Agent ready for production deployment!");
}

main();
