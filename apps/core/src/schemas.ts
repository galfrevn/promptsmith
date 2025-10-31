import type { z } from "zod";

/**
 * Internal type representing Zod schema definition structure.
 *
 * Zod v4 stores schema metadata in a `_def` property with different structures
 * depending on the Zod version. This interface provides a unified type for
 * accessing these internals across Zod v3 and v4.
 *
 * Note: We access Zod internals because there's no official public API for
 * schema introspection. This is necessary to generate human-readable parameter
 * documentation from Zod schemas.
 */
type ZodDef = {
  /**
   * Type identifier in Zod v4 (e.g., "string", "object")
   */
  type?: string;

  /**
   * Type identifier in Zod v3 (e.g., "ZodString", "ZodObject")
   */
  typeName?: string;

  /**
   * For optional types, contains the wrapped inner type
   */
  innerType?: z.ZodType;

  /**
   * For object types, contains the shape definition (may be getter or object)
   */
  shape?: Record<string, z.ZodType> | (() => Record<string, z.ZodType>);
};

/**
 * Extracts the type identifier from a Zod schema's internal definition.
 *
 * This function handles differences between Zod v3 (uses `typeName`) and
 * Zod v4 (uses `type`) by checking both properties and returning the first
 * one found.
 *
 * @param schema - Any Zod schema type
 * @returns The type identifier string, or "unknown" if not found
 *
 * @internal
 */
function getType(schema: z.ZodType): string {
  const def = schema._def as ZodDef;
  return def.type || def.typeName || "unknown";
}

/**
 * Extracts a human-readable type name from a Zod schema.
 *
 * This function introspects Zod's internal structure to determine the schema type
 * and returns a simplified, human-readable name. It handles optional types by
 * unwrapping them to get the underlying type.
 *
 * Supports both Zod v3 and v4 by checking for both old-style (`ZodString`) and
 * new-style (`string`) type identifiers.
 *
 * @param schema - The Zod schema to analyze
 * @returns A human-readable type name like "string", "number", "boolean", etc.
 *
 * @example
 * ```typescript
 * getZodTypeName(z.string()) // returns "string"
 * getZodTypeName(z.number().optional()) // returns "number" (unwraps optional)
 * getZodTypeName(z.enum(["a", "b"])) // returns "enum"
 * ```
 */
export function getZodTypeName(schema: z.ZodType): string {
  const type = getType(schema);

  // Handle optional by unwrapping it
  if (type === "optional" || type === "ZodOptional") {
    const def = schema._def as ZodDef;
    return def.innerType ? getZodTypeName(def.innerType) : "unknown";
  }

  // Map type names to readable type names (supporting both Zod v3 and v4)
  switch (type) {
    case "string":
    case "ZodString":
      return "string";
    case "number":
    case "ZodNumber":
      return "number";
    case "boolean":
    case "ZodBoolean":
      return "boolean";
    case "array":
    case "ZodArray":
      return "array";
    case "object":
    case "ZodObject":
      return "object";
    case "enum":
    case "ZodEnum":
      return "enum";
    case "union":
    case "ZodUnion":
      return "union";
    case "literal":
    case "ZodLiteral":
      return "literal";
    default:
      return "unknown";
  }
}

/**
 * Checks if a Zod schema represents an optional value.
 *
 * Optional schemas are created with `.optional()` and wrap an inner type.
 * This function detects both Zod v3 and v4 optional type identifiers.
 *
 * @param schema - The Zod schema to check
 * @returns True if the schema is optional, false otherwise
 *
 * @internal
 */
function isOptional(schema: z.ZodType): boolean {
  const type = getType(schema);
  return type === "optional" || type === "ZodOptional";
}

/**
 * Extracts the description text from a Zod schema if present.
 *
 * Descriptions are added to Zod schemas using `.describe("text")` and are
 * accessible via the schema's `description` property. These descriptions are
 * used to document parameters in the generated system prompt.
 *
 * @param schema - The Zod schema to extract description from
 * @returns The description string, or undefined if no description exists
 *
 * @internal
 */
function getDescription(schema: z.ZodType): string | undefined {
  return schema.description;
}

/**
 * Converts a Zod object schema into markdown parameter documentation.
 *
 * This function introspects a Zod object schema and generates a markdown list
 * documenting each parameter with its type, requirement level, and description.
 * The output is designed to be included in AI system prompts to explain tool
 * parameters to the model.
 *
 * The function handles:
 * - Both Zod v3 (shape as function) and v4 (shape as property)
 * - Optional vs required fields
 * - Field descriptions from `.describe()`
 * - Various Zod types (string, number, boolean, array, enum, etc.)
 *
 * Non-object schemas return a generic fallback message since we can only
 * introspect object shapes.
 *
 * @param schema - A Zod schema, typically a `z.object()` schema
 * @returns Markdown-formatted parameter documentation as a string
 *
 * @example
 * ```typescript
 * const schema = z.object({
 *   name: z.string().describe("User's full name"),
 *   age: z.number().describe("User's age in years"),
 *   email: z.string().email().optional().describe("Contact email")
 * });
 *
 * parseZodSchema(schema);
 * // Returns:
 * // - `name` (string, required): User's full name
 * // - `age` (number, required): User's age in years
 * // - `email` (string, optional): Contact email
 * ```
 */
export function parseZodSchema(schema: z.ZodType): string {
  const type = getType(schema);

  // Only handle object schemas
  if (type !== "object" && type !== "ZodObject") {
    return "- Schema definition available";
  }

  // In Zod v4, shape is a property; in v3, it's a function
  const def = schema._def as ZodDef;
  const shape = typeof def.shape === "function" ? def.shape() : def.shape;

  if (!shape) {
    return "- Schema definition available";
  }

  const lines: string[] = [];

  for (const [fieldName, fieldSchema] of Object.entries(shape)) {
    const zodSchema = fieldSchema as z.ZodType;
    const optional = isOptional(zodSchema);
    const typeName = getZodTypeName(zodSchema);
    const description = getDescription(zodSchema) || "No description provided";
    const requirement = optional ? "optional" : "required";

    lines.push(
      `- \`${fieldName}\` (${typeName}, ${requirement}): ${description}`
    );
  }

  return lines.join("\n");
}
