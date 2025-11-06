/**
 * Conditional Logic Example
 *
 * This example demonstrates how to use conditional methods to create
 * dynamic agents that adapt based on runtime conditions.
 *
 * Key concepts:
 * - `withToolIf()` for conditional tool addition
 * - `withConstraintIf()` for conditional constraints
 * - Environment-based configuration
 * - Role-based access control
 */

import { createPromptBuilder } from "promptsmith-ts/builder";
import { z } from "zod";

function createDynamicAgent(userRole: string, environment: string) {
  const isDevelopment = environment === "development";
  const isAdmin = userRole === "admin";

  const agent = createPromptBuilder()
    .withIdentity("Data analysis assistant")
    .withCapabilities(["Query databases", "Generate reports"])
    .withTool({
      name: "query-database",
      description: "Execute SQL queries",
      schema: z.object({
        query: z.string(),
        database: z.enum(["analytics", "users"]),
      }),
    })
    // ✅ Only add delete tool for admin users
    .withToolIf(isAdmin, {
      name: "delete-records",
      description: "Delete database records",
      schema: z.object({
        table: z.string(),
        ids: z.array(z.string()),
      }),
    })
    // ✅ Add debug constraints in development
    .withConstraintIf(isDevelopment, "must", "Include detailed query execution plans")
    .withConstraintIf(isDevelopment, "must", "Log all database operations")
    // ✅ Add safety constraints in production
    .withConstraintIf(!isDevelopment, "must_not", "Expose internal database structure")
    .withConstraintIf(!isDevelopment, "must", "Sanitize all output before display")
    // ✅ Restrict non-admin users
    .withConstraintIf(!isAdmin, "must_not", "Delete or modify data")
    .withGuardrails();

  return agent;
}

function main() {
  console.log("=== Example 1: Admin in Development ===\n");

  const devAdmin = createDynamicAgent("admin", "development");
  const devAdminSummary = devAdmin.getSummary();

  console.log(`Tools: ${devAdminSummary.toolsCount}`); // Has delete tool
  console.log(`Constraints: ${devAdminSummary.constraintsCount}`);
  console.log(`- Must: ${devAdminSummary.constraintsByType.must}`);
  console.log(`- Must Not: ${devAdminSummary.constraintsByType.must_not}\n`);

  // ---

  console.log("=== Example 2: Regular User in Production ===\n");

  const prodUser = createDynamicAgent("user", "production");
  const prodUserSummary = prodUser.getSummary();

  console.log(`Tools: ${prodUserSummary.toolsCount}`); // No delete tool
  console.log(`Constraints: ${prodUserSummary.constraintsCount}`);
  console.log(`- Must: ${prodUserSummary.constraintsByType.must}`);
  console.log(`- Must Not: ${prodUserSummary.constraintsByType.must_not}\n`);

  // ---

  console.log("=== Example 3: Multiple Conditional Constraints ===\n");

  const securityLevel = "high";
  const hasExternalAccess = true;

  const secureAgent = createPromptBuilder()
    .withIdentity("Secure assistant")
    .withConstraintIf(securityLevel === "high", "must", [
      "Verify user identity before responding",
      "Log all interactions",
      "Encrypt sensitive data",
    ])
    .withConstraintIf(hasExternalAccess, "must_not", [
      "Access internal systems",
      "Share proprietary information",
    ])
    .withGuardrails();

  const secureConstraints = secureAgent.getConstraintsByType("must");
  console.log(`Security constraints added: ${secureConstraints.length}`);
  for (const constraint of secureConstraints) {
    console.log(`  - ${constraint}`);
  }
}

main();
