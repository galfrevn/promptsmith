import { describe, test, expect, beforeEach } from "bun:test";

import { createPromptBuilder, SystemPromptBuilder } from "../../../src/core/builder";
import { z } from "zod";

describe("SystemPromptBuilder", () => {
  describe("Factory function", () => {
    test("createPromptBuilder creates a new builder instance", () => {
      const builder = createPromptBuilder();
      expect(builder).toBeInstanceOf(SystemPromptBuilder);
    });

    test("each call creates a new independent instance", () => {
      const builder1 = createPromptBuilder();
      const builder2 = createPromptBuilder();
      expect(builder1).not.toBe(builder2);
    });
  });

  describe("Basic configuration", () => {
    let builder: SystemPromptBuilder;

    beforeEach(() => {
      builder = createPromptBuilder();
    });

    test("empty builder builds empty string", () => {
      const prompt = builder.build();
      expect(prompt).toBe("");
    });

    test("builder with only identity", () => {
      const prompt = builder.identity("You are a helpful assistant").build();
      
      expect(prompt).toContain("# Identity");
      expect(prompt).toContain("You are a helpful assistant");
    });
  });

  describe("Identity", () => {
    let builder: SystemPromptBuilder;

    beforeEach(() => {
      builder = createPromptBuilder();
    });

    test("sets agent identity", () => {
      const prompt = builder
        .identity("You are an expert travel assistant")
        .build();
      
      expect(prompt).toContain("You are an expert travel assistant");
    });

    test("identity appears first in prompt", () => {
      const prompt = builder
        .identity("Test identity")
        .capability("Test capability")
        .build();
      
      const identityIndex = prompt.indexOf("# Identity");
      const capabilityIndex = prompt.indexOf("# Capabilities");
      expect(identityIndex).toBeLessThan(capabilityIndex);
    });

    test("identity can be overwritten", () => {
      const prompt = builder
        .identity("First identity")
        .identity("Second identity")
        .build();
      
      expect(prompt).not.toContain("First identity");
      expect(prompt).toContain("Second identity");
    });

    test("returns this for chaining", () => {
      const result = builder.identity("Test");
      expect(result).toBe(builder);
    });
  });

  describe("Capabilities", () => {
    let builder: SystemPromptBuilder;

    beforeEach(() => {
      builder = createPromptBuilder();
    });

    test("adds single capability", () => {
      const prompt = builder
        .identity("Assistant")
        .capability("Search the web")
        .build();
      
      expect(prompt).toContain("# Capabilities");
      expect(prompt).toContain("1. Search the web");
    });

    test("adds multiple capabilities via capability()", () => {
      const prompt = builder
        .capability("First")
        .capability("Second")
        .capability("Third")
        .build();
      
      expect(prompt).toContain("1. First");
      expect(prompt).toContain("2. Second");
      expect(prompt).toContain("3. Third");
    });

    test("adds multiple capabilities via capabilities()", () => {
      const prompt = builder
        .capabilities(["Analyze data", "Generate reports"])
        .build();
      
      expect(prompt).toContain("Analyze data");
      expect(prompt).toContain("Generate reports");
    });

    test("mixes capability() and capabilities()", () => {
      const prompt = builder
        .capability("First")
        .capabilities(["Second", "Third"])
        .capability("Fourth")
        .build();
      
      expect(prompt).toContain("1. First");
      expect(prompt).toContain("2. Second");
      expect(prompt).toContain("3. Third");
      expect(prompt).toContain("4. Fourth");
    });

    test("filters out empty strings", () => {
      const prompt = builder
        .capability("")
        .capabilities(["Valid", "", "Another valid"])
        .build();
      
      expect(prompt).toContain("1. Valid");
      expect(prompt).toContain("2. Another valid");
      expect(prompt).not.toContain("3.");
    });

    test("returns this for chaining", () => {
      expect(builder.capability("Test")).toBe(builder);
      expect(builder.capabilities(["Test"])).toBe(builder);
    });
  });

  describe("Tools", () => {
    let builder: SystemPromptBuilder;

    beforeEach(() => {
      builder = createPromptBuilder();
    });

    test("adds tool with schema", () => {
      const prompt = builder
        .tool({
          name: "get_weather",
          description: "Gets weather for a location",
          schema: z.object({
            location: z.string().describe("City name"),
          }),
        })
        .build();
      
      expect(prompt).toContain("# Available Tools");
      expect(prompt).toContain("## get_weather");
      expect(prompt).toContain("Gets weather for a location");
      expect(prompt).toContain("**Parameters:**");
      expect(prompt).toContain("location");
      expect(prompt).toContain("City name");
    });

    test("handles optional parameters", () => {
      const prompt = builder
        .tool({
          name: "search",
          description: "Search",
          schema: z.object({
            query: z.string().describe("Search query"),
            limit: z.number().optional().describe("Max results"),
          }),
        })
        .build();
      
      expect(prompt).toContain("query");
      expect(prompt).toContain("required");
      expect(prompt).toContain("limit");
      expect(prompt).toContain("optional");
    });

    test("handles multiple tools", () => {
      const prompt = builder
        .tool({
          name: "tool_one",
          description: "First tool",
          schema: z.object({ arg: z.string() }),
        })
        .tool({
          name: "tool_two",
          description: "Second tool",
          schema: z.object({ arg: z.number() }),
        })
        .build();
      
      expect(prompt).toContain("tool_one");
      expect(prompt).toContain("tool_two");
      expect(prompt).toContain("First tool");
      expect(prompt).toContain("Second tool");
    });

    test("handles different Zod types", () => {
      const prompt = builder
        .tool({
          name: "complex_tool",
          description: "Complex tool",
          schema: z.object({
            text: z.string(),
            count: z.number(),
            flag: z.boolean(),
            items: z.array(z.string()),
            category: z.enum(["a", "b", "c"]),
          }),
        })
        .build();
      
      expect(prompt).toContain("string");
      expect(prompt).toContain("number");
      expect(prompt).toContain("boolean");
      expect(prompt).toContain("array");
      expect(prompt).toContain("enum");
    });

    test("adds multiple tools via tools()", () => {
      const toolsList = [
        {
          name: "tool1",
          description: "Tool 1",
          schema: z.object({ a: z.string() }),
        },
        {
          name: "tool2",
          description: "Tool 2",
          schema: z.object({ b: z.number() }),
        },
      ];

      const prompt = builder.tools(toolsList).build();
      
      expect(prompt).toContain("tool1");
      expect(prompt).toContain("tool2");
    });

    test("getTools returns registered tools", () => {
      const tool1 = {
        name: "tool1",
        description: "Tool 1",
        schema: z.object({ a: z.string() }),
      };
      const tool2 = {
        name: "tool2",
        description: "Tool 2",
        schema: z.object({ b: z.number() }),
      };

      builder.tool(tool1).tool(tool2);

      const tools = builder.getTools();
      expect(tools).toHaveLength(2);
      expect(tools[0].name).toBe("tool1");
      expect(tools[1].name).toBe("tool2");
    });

    test("returns this for chaining", () => {
      const tool = {
        name: "test",
        description: "Test",
        schema: z.object({}),
      };
      expect(builder.tool(tool)).toBe(builder);
      expect(builder.tools([tool])).toBe(builder);
    });
  });

  describe("Constraints", () => {
    let builder: SystemPromptBuilder;

    beforeEach(() => {
      builder = createPromptBuilder();
    });

    test("adds must constraint", () => {
      const prompt = builder
        .constraint("must", "Always cite sources")
        .build();
      
      expect(prompt).toContain("# Behavioral Guidelines");
      expect(prompt).toContain("## You MUST:");
      expect(prompt).toContain("Always cite sources");
    });

    test("adds must_not constraint", () => {
      const prompt = builder
        .constraint("must_not", "Never share personal data")
        .build();
      
      expect(prompt).toContain("## You MUST NOT:");
      expect(prompt).toContain("Never share personal data");
    });

    test("adds should constraint", () => {
      const prompt = builder
        .constraint("should", "Prefer concise responses")
        .build();
      
      expect(prompt).toContain("## You SHOULD:");
      expect(prompt).toContain("Prefer concise responses");
    });

    test("adds should_not constraint", () => {
      const prompt = builder
        .constraint("should_not", "Avoid technical jargon")
        .build();
      
      expect(prompt).toContain("## You SHOULD NOT:");
      expect(prompt).toContain("Avoid technical jargon");
    });

    test("groups constraints by type", () => {
      const prompt = builder
        .constraint("must", "First must")
        .constraint("should", "First should")
        .constraint("must", "Second must")
        .constraint("must_not", "First must not")
        .constraint("should_not", "First should not")
        .build();
      
      const mustIndex = prompt.indexOf("## You MUST:");
      const mustNotIndex = prompt.indexOf("## You MUST NOT:");
      const shouldIndex = prompt.indexOf("## You SHOULD:");
      const shouldNotIndex = prompt.indexOf("## You SHOULD NOT:");
      
      expect(mustIndex).toBeGreaterThan(-1);
      expect(mustNotIndex).toBeGreaterThan(mustIndex);
      expect(shouldIndex).toBeGreaterThan(mustNotIndex);
      expect(shouldNotIndex).toBeGreaterThan(shouldIndex);
      expect(prompt).toContain("First must");
      expect(prompt).toContain("Second must");
      expect(prompt).toContain("First should not");
    });

    test("handles all constraint types", () => {
      const prompt = builder
        .constraint("must", "Must rule")
        .constraint("must_not", "Must not rule")
        .constraint("should", "Should rule")
        .constraint("should_not", "Should not rule")
        .build();
      
      expect(prompt).toContain("## You MUST:");
      expect(prompt).toContain("## You MUST NOT:");
      expect(prompt).toContain("## You SHOULD:");
      expect(prompt).toContain("## You SHOULD NOT:");
    });

    test("filters out empty constraint rules", () => {
      const prompt = builder
        .constraint("must", "")
        .constraint("must", "Valid rule")
        .build();
      
      expect(prompt).toContain("Valid rule");
      // Should still have the section but only one item
      const mustSection = prompt.substring(prompt.indexOf("## You MUST:"));
      const bulletCount = (mustSection.match(/^- /gm) || []).length;
      expect(bulletCount).toBe(1);
    });

    test("returns this for chaining", () => {
      const result = builder.constraint("must", "Test");
      expect(result).toBe(builder);
    });
  });

  describe("Output format", () => {
    let builder: SystemPromptBuilder;

    beforeEach(() => {
      builder = createPromptBuilder();
    });

    test("sets output format", () => {
      const prompt = builder
        .output("Respond in JSON format")
        .build();
      
      expect(prompt).toContain("# Output Format");
      expect(prompt).toContain("Respond in JSON format");
    });

    test("handles multiline output format", () => {
      const format = `Respond using this structure:
1. Summary
2. Details
3. Conclusion`;

      const prompt = builder.output(format).build();
      
      expect(prompt).toContain("Summary");
      expect(prompt).toContain("Details");
      expect(prompt).toContain("Conclusion");
    });

    test("returns this for chaining", () => {
      const result = builder.output("Test");
      expect(result).toBe(builder);
    });
  });

  describe("Tone", () => {
    let builder: SystemPromptBuilder;

    beforeEach(() => {
      builder = createPromptBuilder();
    });

    test("sets communication tone", () => {
      const prompt = builder
        .withTone("Be friendly and professional")
        .build();
      
      expect(prompt).toContain("# Communication Style");
      expect(prompt).toContain("Be friendly and professional");
    });

    test("returns this for chaining", () => {
      const result = builder.withTone("Test");
      expect(result).toBe(builder);
    });
  });

  describe("Complete workflow", () => {
    test("builds comprehensive prompt", () => {
      const prompt = createPromptBuilder()
        .identity("Expert travel assistant")
        .capabilities(["Plan itineraries", "Check weather", "Find activities"])
        .tool({
          name: "get_weather",
          description: "Get weather data",
          schema: z.object({
            location: z.string().describe("City name"),
          }),
        })
        .constraint("must", "Always verify locations exist")
        .constraint("must_not", "Never recommend unsafe destinations")
        .withTone("Friendly and helpful")
        .output("Provide brief intro, then bullet points")
        .build();
      
      expect(prompt).toContain("# Identity");
      expect(prompt).toContain("# Capabilities");
      expect(prompt).toContain("# Available Tools");
      expect(prompt).toContain("# Behavioral Guidelines");
      expect(prompt).toContain("# Communication Style");
      expect(prompt).toContain("# Output Format");
    });

    test("sections appear in correct order", () => {
      const prompt = createPromptBuilder()
        .identity("Test")
        .capability("Test")
        .tool({
          name: "test",
          description: "Test",
          schema: z.object({}),
        })
        .constraint("must", "Test")
        .withTone("Test")
        .output("Test")
        .build();
      
      const identityIndex = prompt.indexOf("# Identity");
      const capabilitiesIndex = prompt.indexOf("# Capabilities");
      const toolsIndex = prompt.indexOf("# Available Tools");
      const guidelinesIndex = prompt.indexOf("# Behavioral Guidelines");
      const styleIndex = prompt.indexOf("# Communication Style");
      const outputIndex = prompt.indexOf("# Output Format");
      
      expect(identityIndex).toBeLessThan(capabilitiesIndex);
      expect(capabilitiesIndex).toBeLessThan(toolsIndex);
      expect(toolsIndex).toBeLessThan(guidelinesIndex);
      expect(guidelinesIndex).toBeLessThan(styleIndex);
      expect(styleIndex).toBeLessThan(outputIndex);
    });
  });

  describe("toJSON", () => {
    test("exports configuration as object", () => {
      const builder = createPromptBuilder()
        .identity("Test assistant")
        .capability("Test capability")
        .tool({
          name: "test_tool",
          description: "Test",
          schema: z.object({ arg: z.string() }),
        })
        .constraint("must", "Test constraint")
        .output("Test format");
      
      const json = builder.toJSON();
      
      expect(json).toHaveProperty("identity");
      expect(json).toHaveProperty("capabilities");
      expect(json).toHaveProperty("tools");
      expect(json).toHaveProperty("constraints");
      expect(json).toHaveProperty("outputFormat");
      expect(json).toHaveProperty("tone");
    });

    test("json contains correct values", () => {
      const builder = createPromptBuilder()
        .identity("Test")
        .capability("Cap1");
      
      const json = builder.toJSON() as {
        identity: string;
        capabilities: string[];
        tools: unknown[];
      };
      
      expect(json.identity).toBe("Test");
      expect(json.capabilities).toEqual(["Cap1"]);
      expect(json.tools).toHaveLength(0);
    });
  });

  describe("Method chaining", () => {
    test("supports fluent interface", () => {
      const builder = createPromptBuilder()
        .identity("Test")
        .capability("Test capability")
        .constraint("must", "Test constraint")
        .withTone("Test tone")
        .output("Test output");
      
      expect(builder).toBeInstanceOf(SystemPromptBuilder);
      expect(typeof builder.build).toBe("function");
    });

    test("all methods return this", () => {
      const builder = createPromptBuilder();
      
      expect(builder.identity("Test")).toBe(builder);
      expect(builder.capability("Test")).toBe(builder);
      expect(builder.capabilities([])).toBe(builder);
      expect(builder.tool({
        name: "test",
        description: "test",
        schema: z.object({})
      })).toBe(builder);
      expect(builder.tools([])).toBe(builder);
      expect(builder.constraint("must", "Test")).toBe(builder);
      expect(builder.output("Test")).toBe(builder);
      expect(builder.withTone("Test")).toBe(builder);
    });
  });

  describe("Edge cases", () => {
    test("handles empty strings gracefully", () => {
      const prompt = createPromptBuilder()
        .identity("")
        .capability("")
        .build();
      
      expect(prompt.trim()).toBe("");
    });

    test("handles tool with no description in schema fields", () => {
      const prompt = createPromptBuilder()
        .tool({
          name: "simple_tool",
          description: "A simple tool",
          schema: z.object({
            param: z.string(), // No .describe()
          }),
        })
        .build();
      
      expect(prompt).toContain("simple_tool");
      expect(prompt).toContain("param");
      expect(prompt).toContain("No description provided");
    });

    test("maintains prompt consistency across builds", () => {
      const builder = createPromptBuilder()
        .identity("Consistent assistant")
        .capability("Do things");
      
      const prompt1 = builder.build();
      const prompt2 = builder.build();
      
      expect(prompt1).toBe(prompt2);
    });

    test("handles special characters in content", () => {
      const prompt = createPromptBuilder()
        .identity('You are "The Assistant" (with quotes)')
        .capability("Handle <special> & characters")
        .tool({
          name: "special_tool",
          description: "Uses * and $ symbols",
          schema: z.object({
            param: z.string().describe("Accepts # and @ characters"),
          }),
        })
        .build();
      
      expect(prompt).toContain('"The Assistant"');
      expect(prompt).toContain("<special>");
      expect(prompt).toContain("&");
      expect(prompt).toContain("* and $");
      expect(prompt).toContain("# and @");
    });

    test("handles large number of capabilities", () => {
      const capabilities = Array.from({ length: 100 }, (_, i) => `Capability ${i + 1}`);
      const prompt = createPromptBuilder()
        .capabilities(capabilities)
        .build();
      
      expect(prompt).toContain("1. Capability 1");
      expect(prompt).toContain("100. Capability 100");
    });

    test("empty builder returns empty string from build", () => {
      const prompt = createPromptBuilder().build();
      expect(prompt).toBe("");
    });
  });

  describe("Real-world scenarios", () => {
    test("travel assistant agent", () => {
      const prompt = createPromptBuilder()
        .identity("You are an expert travel assistant specialized in creating personalized itineraries")
        .capabilities([
          "Research destinations and provide recommendations",
          "Check current weather conditions",
          "Find activities based on user preferences"
        ])
        .tool({
          name: "get_weather",
          description: "Retrieves current weather for a location",
          schema: z.object({
            location: z.string().describe("City or address"),
            units: z.enum(["celsius", "fahrenheit"]).optional()
          })
        })
        .constraint("must", "Always check weather before recommending outdoor activities")
        .constraint("must_not", "Never recommend locations without verifying they exist")
        .withTone("Be enthusiastic, friendly, and informative")
        .build();
      
      expect(prompt).toContain("travel assistant");
      expect(prompt).toContain("get_weather");
      expect(prompt).toContain("weather before recommending");
    });

    test("code review assistant agent", () => {
      const prompt = createPromptBuilder()
        .identity("You are an expert code reviewer with 10+ years of experience")
        .capabilities([
          "Analyze code quality and complexity",
          "Identify security vulnerabilities",
          "Suggest best practices"
        ])
        .tool({
          name: "analyze_complexity",
          description: "Analyzes code complexity",
          schema: z.object({
            code: z.string().describe("Code to analyze"),
            language: z.string().describe("Programming language")
          })
        })
        .constraint("must", "Always explain reasoning behind suggestions")
        .constraint("must_not", "Never approve code with known security vulnerabilities")
        .output("Format: Summary, Issues, Suggestions, Positive Points")
        .build();
      
      expect(prompt).toContain("code reviewer");
      expect(prompt).toContain("analyze_complexity");
      expect(prompt).toContain("Format:");
    });

    test("minimal agent with just identity", () => {
      const prompt = createPromptBuilder()
        .identity("You are a helpful assistant")
        .build();
      
      expect(prompt).toContain("helpful assistant");
      expect(prompt).not.toContain("# Capabilities");
      expect(prompt).not.toContain("# Available Tools");
    });
  });

  describe("AI SDK Integration", () => {
    describe("toAiSdkTools()", () => {
      test("exports tool with execute function", async () => {
        const builder = createPromptBuilder()
          .tool({
            name: "get_weather",
            description: "Get the weather for a city",
            schema: z.object({
              city: z.string().describe("The city name")
            }),
            execute: async ({ city }) => {
              return { temperature: 72, city };
            }
          });

        const tools = builder.toAiSdkTools();

        expect(tools.get_weather).toBeDefined();
        expect(tools.get_weather.description).toBe("Get the weather for a city");
        expect(tools.get_weather.parameters).toBeDefined();
        expect(typeof tools.get_weather.execute).toBe("function");

        // Test that execute function works
        const result = await tools.get_weather.execute?.({ city: "Paris" });
        expect(result).toEqual({ temperature: 72, city: "Paris" });
      });

      test("exports tool without execute function as undefined", () => {
        const builder = createPromptBuilder()
          .tool({
            name: "analyze_sentiment",
            description: "Analyze text sentiment",
            schema: z.object({
              text: z.string().describe("Text to analyze")
            })
          });

        const tools = builder.toAiSdkTools();

        expect(tools.analyze_sentiment).toBeDefined();
        expect(tools.analyze_sentiment.description).toBe("Analyze text sentiment");
        expect(tools.analyze_sentiment.parameters).toBeDefined();
        expect(tools.analyze_sentiment.execute).toBeUndefined();
      });

      test("exports multiple tools with mixed execute functions", async () => {
        const builder = createPromptBuilder()
          .tool({
            name: "tool_with_execute",
            description: "Tool with execution",
            schema: z.object({ input: z.string() }),
            execute: async ({ input }) => `Result: ${input}`
          })
          .tool({
            name: "tool_without_execute",
            description: "Tool without execution",
            schema: z.object({ data: z.number() })
          })
          .tool({
            name: "another_with_execute",
            description: "Another executable tool",
            schema: z.object({ value: z.boolean() }),
            execute: ({ value }) => ({ processed: value })
          });

        const tools = builder.toAiSdkTools();

        expect(Object.keys(tools)).toHaveLength(3);
        expect(typeof tools.tool_with_execute.execute).toBe("function");
        expect(tools.tool_without_execute.execute).toBeUndefined();
        expect(typeof tools.another_with_execute.execute).toBe("function");

        // Test execution
        const result1 = await tools.tool_with_execute.execute?.({ input: "test" });
        expect(result1).toBe("Result: test");

        const result2 = tools.another_with_execute.execute?.({ value: true });
        expect(result2).toEqual({ processed: true });
      });

      test("returns empty object for builder with no tools", () => {
        const builder = createPromptBuilder()
          .identity("Test assistant");

        const tools = builder.toAiSdkTools();

        expect(tools).toEqual({});
        expect(Object.keys(tools)).toHaveLength(0);
      });

      test("uses tool name as key in returned object", () => {
        const builder = createPromptBuilder()
          .tool({
            name: "custom_tool_name",
            description: "A custom tool",
            schema: z.object({})
          });

        const tools = builder.toAiSdkTools();

        expect(tools.custom_tool_name).toBeDefined();
        expect(tools["custom_tool_name"]).toBeDefined();
      });

      test("correctly maps description and parameters", () => {
        const schema = z.object({
          location: z.string().describe("City name"),
          units: z.enum(["celsius", "fahrenheit"]).optional()
        });

        const builder = createPromptBuilder()
          .tool({
            name: "weather",
            description: "Get weather information",
            schema: schema
          });

        const tools = builder.toAiSdkTools();

        expect(tools.weather.description).toBe("Get weather information");
        expect(tools.weather.parameters).toBe(schema);
      });

      test("handles synchronous execute functions", () => {
        const builder = createPromptBuilder()
          .tool({
            name: "add",
            description: "Add two numbers",
            schema: z.object({
              a: z.number(),
              b: z.number()
            }),
            execute: ({ a, b }) => a + b
          });

        const tools = builder.toAiSdkTools();
        const result = tools.add.execute?.({ a: 2, b: 3 });

        expect(result).toBe(5);
      });

      test("handles asynchronous execute functions", async () => {
        const builder = createPromptBuilder()
          .tool({
            name: "fetch_data",
            description: "Fetch data",
            schema: z.object({ url: z.string() }),
            execute: async ({ url }) => {
              await new Promise(resolve => setTimeout(resolve, 10));
              return { data: `fetched from ${url}` };
            }
          });

        const tools = builder.toAiSdkTools();
        const result = await tools.fetch_data.execute?.({ url: "https://api.example.com" });

        expect(result).toEqual({ data: "fetched from https://api.example.com" });
      });
    });

    describe("toAiSdk()", () => {
      test("returns object with system and tools properties", () => {
        const builder = createPromptBuilder()
          .identity("Test assistant")
          .tool({
            name: "test_tool",
            description: "A test tool",
            schema: z.object({ input: z.string() }),
            execute: ({ input }) => input
          });

        const config = builder.toAiSdk();

        expect(config).toHaveProperty("system");
        expect(config).toHaveProperty("tools");
        expect(typeof config.system).toBe("string");
        expect(typeof config.tools).toBe("object");
      });

      test("system property matches build() output", () => {
        const builder = createPromptBuilder()
          .identity("You are a helpful assistant")
          .capabilities(["Answer questions", "Provide information"])
          .constraint("must", "Always be helpful");

        const config = builder.toAiSdk();
        const builtPrompt = builder.build();

        expect(config.system).toBe(builtPrompt);
      });

      test("tools property matches toAiSdkTools() output", () => {
        const builder = createPromptBuilder()
          .tool({
            name: "tool1",
            description: "First tool",
            schema: z.object({ a: z.string() }),
            execute: ({ a }) => a
          })
          .tool({
            name: "tool2",
            description: "Second tool",
            schema: z.object({ b: z.number() })
          });

        const config = builder.toAiSdk();
        const tools = builder.toAiSdkTools();

        expect(config.tools).toEqual(tools);
      });

      test("can be destructured for use with AI SDK", () => {
        const builder = createPromptBuilder()
          .identity("Weather assistant")
          .tool({
            name: "get_weather",
            description: "Get weather",
            schema: z.object({ location: z.string() }),
            execute: async ({ location }) => ({ temp: 20, location })
          });

        const { system, tools } = builder.toAiSdk();

        expect(typeof system).toBe("string");
        expect(system).toContain("Weather assistant");
        expect(tools.get_weather).toBeDefined();
        expect(typeof tools.get_weather.execute).toBe("function");
      });

      test("works with builder that has no tools", () => {
        const builder = createPromptBuilder()
          .identity("Simple assistant")
          .capabilities(["Chat", "Help"]);

        const config = builder.toAiSdk();

        expect(config.system).toContain("Simple assistant");
        expect(config.tools).toEqual({});
      });

      test("includes all builder configuration in system prompt", () => {
        const builder = createPromptBuilder()
          .identity("Complex assistant")
          .capabilities(["Capability 1", "Capability 2"])
          .tool({
            name: "tool1",
            description: "Tool description",
            schema: z.object({ param: z.string() })
          })
          .constraint("must", "Be accurate")
          .constraint("must_not", "Make assumptions")
          .withTone("Professional and friendly")
          .output("Use markdown format");

        const config = builder.toAiSdk();

        expect(config.system).toContain("Complex assistant");
        expect(config.system).toContain("Capability 1");
        expect(config.system).toContain("tool1");
        expect(config.system).toContain("Be accurate");
        expect(config.system).toContain("Professional and friendly");
        expect(config.system).toContain("Use markdown format");
      });

      test("can be spread into AI SDK function calls", () => {
        const builder = createPromptBuilder()
          .identity("Test")
          .tool({
            name: "test",
            description: "Test",
            schema: z.object({}),
            execute: () => "result"
          });

        const config = builder.toAiSdk();
        
        // Simulate spreading into an AI SDK call
        const mockAiSdkParams = {
          model: "test-model",
          ...config,
          prompt: "Test prompt"
        };

        expect(mockAiSdkParams.system).toBeDefined();
        expect(mockAiSdkParams.tools).toBeDefined();
        expect(mockAiSdkParams.model).toBe("test-model");
        expect(mockAiSdkParams.prompt).toBe("Test prompt");
      });
    });
  });
});
