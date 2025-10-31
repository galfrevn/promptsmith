import { describe, test, expect } from "bun:test";

import { getZodTypeName, parseZodSchema } from "../../../src/utils/schemas";
import { z } from "zod";

describe("Schema Parser Utilities", () => {
  describe("getZodTypeName", () => {
    describe("Basic types", () => {
      test("identifies string type", () => {
        const schema = z.string();
        expect(getZodTypeName(schema)).toBe("string");
      });

      test("identifies number type", () => {
        const schema = z.number();
        expect(getZodTypeName(schema)).toBe("number");
      });

      test("identifies boolean type", () => {
        const schema = z.boolean();
        expect(getZodTypeName(schema)).toBe("boolean");
      });

      test("identifies array type", () => {
        const schema = z.array(z.string());
        expect(getZodTypeName(schema)).toBe("array");
      });

      test("identifies object type", () => {
        const schema = z.object({ key: z.string() });
        expect(getZodTypeName(schema)).toBe("object");
      });

      test("identifies enum type", () => {
        const schema = z.enum(["a", "b", "c"]);
        expect(getZodTypeName(schema)).toBe("enum");
      });

      test("identifies union type", () => {
        const schema = z.union([z.string(), z.number()]);
        expect(getZodTypeName(schema)).toBe("union");
      });

      test("identifies literal type", () => {
        const schema = z.literal("hello");
        expect(getZodTypeName(schema)).toBe("literal");
      });
    });

    describe("Optional types", () => {
      test("unwraps optional string", () => {
        const schema = z.string().optional();
        expect(getZodTypeName(schema)).toBe("string");
      });

      test("unwraps optional number", () => {
        const schema = z.number().optional();
        expect(getZodTypeName(schema)).toBe("number");
      });

      test("unwraps optional boolean", () => {
        const schema = z.boolean().optional();
        expect(getZodTypeName(schema)).toBe("boolean");
      });

      test("unwraps optional array", () => {
        const schema = z.array(z.string()).optional();
        expect(getZodTypeName(schema)).toBe("array");
      });

      test("unwraps optional object", () => {
        const schema = z.object({ key: z.string() }).optional();
        expect(getZodTypeName(schema)).toBe("object");
      });

      test("unwraps optional enum", () => {
        const schema = z.enum(["a", "b"]).optional();
        expect(getZodTypeName(schema)).toBe("enum");
      });
    });

    describe("Edge cases", () => {
      test("returns unknown for unsupported types", () => {
        const schema = z.date();
        expect(getZodTypeName(schema)).toBe("unknown");
      });

      test("handles complex nested optional", () => {
        const schema = z.array(z.number()).optional();
        expect(getZodTypeName(schema)).toBe("array");
      });
    });
  });

  describe("parseZodSchema", () => {
    describe("Basic object schemas", () => {
      test("parses simple object schema", () => {
        const schema = z.object({
          name: z.string().describe("User's name"),
          age: z.number().describe("User's age"),
        });

        const result = parseZodSchema(schema);

        expect(result).toContain("name");
        expect(result).toContain("User's name");
        expect(result).toContain("string");
        expect(result).toContain("required");
        expect(result).toContain("age");
        expect(result).toContain("User's age");
        expect(result).toContain("number");
      });

      test("formats as markdown list", () => {
        const schema = z.object({
          field1: z.string().describe("First field"),
          field2: z.number().describe("Second field"),
        });

        const result = parseZodSchema(schema);

        expect(result).toContain("- `field1`");
        expect(result).toContain("- `field2`");
      });

      test("includes type information", () => {
        const schema = z.object({
          text: z.string(),
          count: z.number(),
          active: z.boolean(),
        });

        const result = parseZodSchema(schema);

        expect(result).toContain("(string,");
        expect(result).toContain("(number,");
        expect(result).toContain("(boolean,");
      });
    });

    describe("Optional fields", () => {
      test("marks optional fields correctly", () => {
        const schema = z.object({
          required: z.string(),
          optional: z.string().optional(),
        });

        const result = parseZodSchema(schema);

        expect(result).toMatch(/required.*required/);
        expect(result).toMatch(/optional.*optional/);
      });

      test("handles all fields optional", () => {
        const schema = z.object({
          field1: z.string().optional(),
          field2: z.number().optional(),
        });

        const result = parseZodSchema(schema);

        const optionalCount = (result.match(/optional/g) || []).length;
        expect(optionalCount).toBe(2);
      });

      test("handles mix of required and optional", () => {
        const schema = z.object({
          id: z.string().describe("Unique ID"),
          name: z.string().describe("Name"),
          email: z.string().optional().describe("Email address"),
          phone: z.string().optional().describe("Phone number"),
        });

        const result = parseZodSchema(schema);

        expect(result).toContain("id");
        expect(result).toContain("required");
        expect(result).toContain("email");
        expect(result).toContain("optional");
      });
    });

    describe("Descriptions", () => {
      test("includes field descriptions", () => {
        const schema = z.object({
          username: z.string().describe("The user's unique username"),
        });

        const result = parseZodSchema(schema);

        expect(result).toContain("The user's unique username");
      });

      test("handles missing descriptions", () => {
        const schema = z.object({
          field: z.string(),
        });

        const result = parseZodSchema(schema);

        expect(result).toContain("field");
        expect(result).toContain("No description provided");
      });

      test("handles long descriptions", () => {
        const longDesc =
          "This is a very long description that explains in detail what this field is for and how it should be used in the context of the application";
        const schema = z.object({
          field: z.string().describe(longDesc),
        });

        const result = parseZodSchema(schema);

        expect(result).toContain(longDesc);
      });

      test("handles descriptions with special characters", () => {
        const schema = z.object({
          field: z
            .string()
            .describe('Description with "quotes", <brackets>, and & symbols'),
        });

        const result = parseZodSchema(schema);

        expect(result).toContain('"quotes"');
        expect(result).toContain("<brackets>");
        expect(result).toContain("& symbols");
      });
    });

    describe("Complex types", () => {
      test("handles array fields", () => {
        const schema = z.object({
          items: z.array(z.string()).describe("List of items"),
        });

        const result = parseZodSchema(schema);

        expect(result).toContain("items");
        expect(result).toContain("array");
        expect(result).toContain("List of items");
      });

      test("handles enum fields", () => {
        const schema = z.object({
          status: z
            .enum(["pending", "active", "inactive"])
            .describe("Current status"),
        });

        const result = parseZodSchema(schema);

        expect(result).toContain("status");
        expect(result).toContain("enum");
        expect(result).toContain("Current status");
      });

      test("handles nested object fields", () => {
        const schema = z.object({
          user: z
            .object({
              name: z.string(),
              age: z.number(),
            })
            .describe("User information"),
        });

        const result = parseZodSchema(schema);

        expect(result).toContain("user");
        expect(result).toContain("object");
        expect(result).toContain("User information");
      });

      test("handles union fields", () => {
        const schema = z.object({
          value: z.union([z.string(), z.number()]).describe("String or number"),
        });

        const result = parseZodSchema(schema);

        expect(result).toContain("value");
        expect(result).toContain("union");
        expect(result).toContain("String or number");
      });

      test("handles literal fields", () => {
        const schema = z.object({
          type: z.literal("user").describe("Type identifier"),
        });

        const result = parseZodSchema(schema);

        expect(result).toContain("type");
        expect(result).toContain("literal");
        expect(result).toContain("Type identifier");
      });
    });

    describe("Real-world schemas", () => {
      test("parses weather tool schema", () => {
        const schema = z.object({
          location: z.string().describe("City or address to check weather"),
          units: z
            .enum(["celsius", "fahrenheit"])
            .optional()
            .describe("Temperature units"),
          includeForecast: z
            .boolean()
            .optional()
            .describe("Include 5-day forecast"),
        });

        const result = parseZodSchema(schema);

        expect(result).toContain("location");
        expect(result).toContain("City or address");
        expect(result).toContain("required");
        expect(result).toContain("units");
        expect(result).toContain("Temperature units");
        expect(result).toContain("optional");
        expect(result).toContain("enum");
        expect(result).toContain("includeForecast");
        expect(result).toContain("boolean");
      });

      test("parses search tool schema", () => {
        const schema = z.object({
          query: z.string().describe("Search query text"),
          limit: z.number().optional().describe("Maximum results to return"),
          filters: z
            .array(z.string())
            .optional()
            .describe("Filter categories"),
        });

        const result = parseZodSchema(schema);

        expect(result).toContain("query");
        expect(result).toContain("Search query text");
        expect(result).toContain("limit");
        expect(result).toContain("Maximum results");
        expect(result).toContain("filters");
        expect(result).toContain("array");
        expect(result).toContain("Filter categories");
      });

      test("parses user profile schema", () => {
        const schema = z.object({
          username: z.string().describe("Unique username"),
          email: z.string().describe("Email address"),
          age: z.number().optional().describe("User's age"),
          bio: z.string().optional().describe("User biography"),
          roles: z.array(z.string()).describe("User roles"),
          isActive: z.boolean().describe("Account status"),
        });

        const result = parseZodSchema(schema);

        expect(result).toContain("username");
        expect(result).toContain("email");
        expect(result).toContain("age");
        expect(result).toContain("bio");
        expect(result).toContain("roles");
        expect(result).toContain("isActive");
      });
    });

    describe("Edge cases", () => {
      test("handles empty object schema", () => {
        const schema = z.object({});
        const result = parseZodSchema(schema);
        expect(result).toBe("");
      });

      test("handles non-object schemas", () => {
        const schema = z.string();
        const result = parseZodSchema(schema);
        expect(result).toBe("- Schema definition available");
      });

      test("handles array schema", () => {
        const schema = z.array(z.string());
        const result = parseZodSchema(schema);
        expect(result).toBe("- Schema definition available");
      });

      test("handles primitive schema", () => {
        const schema = z.number();
        const result = parseZodSchema(schema);
        expect(result).toBe("- Schema definition available");
      });

      test("handles object with many fields", () => {
        const fields: Record<string, z.ZodString> = {};
        for (let i = 1; i <= 20; i++) {
          fields[`field${i}`] = z.string().describe(`Description ${i}`);
        }
        const schema = z.object(fields);

        const result = parseZodSchema(schema);

        expect(result).toContain("field1");
        expect(result).toContain("field20");
        expect(result).toContain("Description 1");
        expect(result).toContain("Description 20");
      });

      test("handles field names with special characters", () => {
        const schema = z.object({
          "user-name": z.string().describe("User name"),
          user_id: z.number().describe("User ID"),
          "user.email": z.string().describe("Email"),
        });

        const result = parseZodSchema(schema);

        expect(result).toContain("`user-name`");
        expect(result).toContain("`user_id`");
        expect(result).toContain("`user.email`");
      });

      test("maintains field order", () => {
        const schema = z.object({
          first: z.string(),
          second: z.string(),
          third: z.string(),
        });

        const result = parseZodSchema(schema);
        const lines = result.split("\n");

        expect(lines[0]).toContain("first");
        expect(lines[1]).toContain("second");
        expect(lines[2]).toContain("third");
      });
    });

    describe("Output format", () => {
      test("returns multiline string with line breaks", () => {
        const schema = z.object({
          field1: z.string(),
          field2: z.string(),
        });

        const result = parseZodSchema(schema);

        expect(result).toContain("\n");
        expect(result.split("\n")).toHaveLength(2);
      });

      test("each field on separate line", () => {
        const schema = z.object({
          a: z.string(),
          b: z.string(),
          c: z.string(),
        });

        const result = parseZodSchema(schema);
        const lines = result.split("\n");

        expect(lines).toHaveLength(3);
        expect(lines[0]).toContain("a");
        expect(lines[1]).toContain("b");
        expect(lines[2]).toContain("c");
      });

      test("uses consistent markdown formatting", () => {
        const schema = z.object({
          field: z.string().describe("Description"),
        });

        const result = parseZodSchema(schema);

        // Should follow pattern: - `field` (type, requirement): description
        expect(result).toMatch(/^- `\w+` \(\w+, \w+\): .+$/);
      });
    });

    describe("Integration with getZodTypeName", () => {
      test("uses correct type names for all field types", () => {
        const schema = z.object({
          str: z.string(),
          num: z.number(),
          bool: z.boolean(),
          arr: z.array(z.string()),
          obj: z.object({ nested: z.string() }),
          enm: z.enum(["a", "b"]),
        });

        const result = parseZodSchema(schema);

        expect(result).toContain("(string,");
        expect(result).toContain("(number,");
        expect(result).toContain("(boolean,");
        expect(result).toContain("(array,");
        expect(result).toContain("(object,");
        expect(result).toContain("(enum,");
      });

      test("correctly unwraps optional types", () => {
        const schema = z.object({
          optionalString: z.string().optional(),
          optionalNumber: z.number().optional(),
          optionalBoolean: z.boolean().optional(),
        });

        const result = parseZodSchema(schema);

        // Should show the unwrapped type, not "optional"
        expect(result).toContain("(string, optional)");
        expect(result).toContain("(number, optional)");
        expect(result).toContain("(boolean, optional)");
      });
    });
  });

  describe("Zod v4 compatibility", () => {
    test("handles Zod v4 string schema", () => {
      const schema = z.string();
      const typeName = getZodTypeName(schema);
      expect(typeName).toBe("string");
    });

    test("handles Zod v4 object schema", () => {
      const schema = z.object({
        field: z.string().describe("Test field"),
      });
      const result = parseZodSchema(schema);
      expect(result).toContain("field");
      expect(result).toContain("Test field");
    });

    test("handles Zod v4 optional schema", () => {
      const schema = z.string().optional();
      const typeName = getZodTypeName(schema);
      expect(typeName).toBe("string");
    });

    test("handles Zod v4 enum schema", () => {
      const schema = z.enum(["option1", "option2"]);
      const typeName = getZodTypeName(schema);
      expect(typeName).toBe("enum");
    });

    test("parses complex Zod v4 object", () => {
      const schema = z.object({
        id: z.string().describe("Unique identifier"),
        data: z.object({
          value: z.number(),
        }),
        tags: z.array(z.string()).optional(),
        type: z.enum(["A", "B", "C"]),
      });

      const result = parseZodSchema(schema);

      expect(result).toContain("id");
      expect(result).toContain("data");
      expect(result).toContain("tags");
      expect(result).toContain("type");
      expect(result).toContain("Unique identifier");
    });
  });

  describe("Type safety", () => {
    test("accepts any ZodType in getZodTypeName", () => {
      const schemas = [
        z.string(),
        z.number(),
        z.boolean(),
        z.array(z.any()),
        z.object({}),
        z.enum(["a"]),
        z.union([z.string(), z.number()]),
        z.literal("test"),
      ];

      for (const schema of schemas) {
        const result = getZodTypeName(schema);
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
      }
    });

    test("accepts any ZodType in parseZodSchema", () => {
      const schemas = [
        z.string(),
        z.number(),
        z.object({ field: z.string() }),
        z.array(z.string()),
      ];

      for (const schema of schemas) {
        const result = parseZodSchema(schema);
        expect(typeof result).toBe("string");
      }
    });
  });
});

