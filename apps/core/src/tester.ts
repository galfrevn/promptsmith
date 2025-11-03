import { generateObject, generateText } from "ai";
import { z } from "zod";

import type { SystemPromptBuilder } from "@/builder";
import type {
  TestCase,
  TestCaseResult,
  TestOptions,
  TestResult,
} from "@/types";

/**
 * Constants for scoring
 */
const MIN_SCORE = 0;
const MAX_SCORE = 100;

/**
 * Evaluation result from the judge LLM.
 */
const EvaluationSchema = z.object({
  result: z
    .enum(["pass", "fail"])
    .describe("Whether the response meets the expected behavior"),
  score: z
    .number()
    .min(MIN_SCORE)
    .max(MAX_SCORE)
    .describe("Numeric score from 0-100 for this response"),
  evaluation: z
    .string()
    .describe(
      "Detailed explanation of why the response passed or failed, with specific feedback"
    ),
});

/**
 * Suggestions for improving the prompt based on test failures.
 */
const SuggestionsSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe(
      "Specific, actionable recommendations for improving the prompt to address the failures"
    ),
});

/**
 * PromptTester evaluates system prompts against test cases using actual LLM responses.
 *
 * This class provides functionality to test prompts in a systematic way:
 * 1. Generates responses using the prompt with a test LLM
 * 2. Evaluates responses using a judge LLM with structured output
 * 3. Provides detailed feedback and suggestions for improvement
 *
 * The testing approach uses "LLM as a judge" - one model evaluates whether
 * another model's response meets the expected behavior. Uses `generateObject`
 * from the AI SDK for reliable structured outputs.
 *
 * @example
 * ```typescript
 * import { createTester } from "promptsmith-ts/tester";
 * import { openai } from "@ai-sdk/openai";
 *
 * const tester = createTester();
 * const builder = createPromptBuilder()
 *   .withIdentity("You are a helpful assistant")
 *   .withCapability("Answer questions");
 *
 * // Test with builder
 * const results = await tester.test({
 *   prompt: builder,
 *   provider: openai("gpt-4"),
 *   testCases: [
 *     {
 *       query: "Hello!",
 *       expectedBehavior: "Respond with a friendly greeting"
 *     }
 *   ]
 * });
 *
 * // Or test with string prompt
 * const results2 = await tester.test({
 *   prompt: "You are a helpful assistant...",
 *   provider: openai("gpt-4"),
 *   testCases: [...]
 * });
 * ```
 */
export class PromptTester {
  /**
   * Tests a system prompt against multiple test cases.
   *
   * For each test case:
   * 1. Generates a response using the system prompt + test query
   * 2. Evaluates the response using a judge LLM
   * 3. Collects results and calculates overall score
   * 4. Provides suggestions for improving failed cases
   *
   * @param config - Test configuration
   * @param config.prompt - The prompt to test (builder or string)
   * @param config.provider - AI SDK provider (model) to generate responses
   * @param config.testCases - Array of test cases to evaluate
   * @param config.options - Optional test configuration
   * @returns Complete test results with scores and suggestions
   *
   * @example
   * ```typescript
   * import { createTester } from "promptsmith-ts/tester";
   * import { createPromptBuilder } from "promptsmith-ts/builder";
   * import { openai } from "@ai-sdk/openai";
   *
   * const tester = createTester();
   * const builder = createPromptBuilder()
   *   .withIdentity("You are a customer service assistant");
   *
   * const results = await tester.test({
   *   prompt: builder, // or use builder.build() for string
   *   provider: openai("gpt-4"),
   *   testCases: [
   *     {
   *       query: "Hello!",
   *       expectedBehavior: "Respond with a friendly greeting and offer to help",
   *       context: "Testing initial user interaction"
   *     },
   *     {
   *       query: "Can you give me medical advice?",
   *       expectedBehavior: "Politely decline and explain limitations",
   *       context: "Testing forbidden topic handling"
   *     }
   *   ],
   *   options: {
   *     temperature: 0.7,
   *     judgeModel: openai("gpt-4") // Optional: different model for judging
   *   }
   * });
   *
   * console.log(`Overall Score: ${results.overallScore}/100`);
   * console.log(`Passed: ${results.passed}, Failed: ${results.failed}`);
   *
   * // Review individual results
   * for (const testCase of results.cases) {
   *   if (testCase.result === "fail") {
   *     console.log(`Failed: ${testCase.testCase.query}`);
   *     console.log(`Reason: ${testCase.evaluation}`);
   *   }
   * }
   *
   * // Get suggestions for improvement
   * console.log("Suggestions:", results.suggestions);
   * ```
   */
  async test(config: {
    prompt: SystemPromptBuilder | string;
    provider: Parameters<typeof generateText>[0]["model"];
    testCases: TestCase[];
    options?: TestOptions;
  }): Promise<TestResult> {
    // Extract system prompt from builder or use string directly
    const systemPrompt =
      typeof config.prompt === "string" ? config.prompt : config.prompt.build();

    const { provider, testCases, options = {} } = config;
    const { temperature = 0.7, judgeModel } = options;
    const judge = judgeModel || provider;

    const caseResults: TestCaseResult[] = [];

    for (const testCase of testCases) {
      try {
        const response = await generateText({
          model: provider,
          system: systemPrompt,
          prompt: testCase.query,
          temperature,
        });

        const actualResponse = response.text;

        const judgePrompt = this.buildJudgePrompt(testCase, actualResponse);

        const evaluation = await generateObject({
          model: judge,
          schema: EvaluationSchema,
          prompt: judgePrompt,
          temperature: 0.2,
        });

        const { result, score, evaluation: evalText } = evaluation.object;

        caseResults.push({
          testCase,
          result,
          actualResponse,
          evaluation: evalText,
          score,
        });
      } catch (error) {
        caseResults.push({
          testCase,
          result: "fail",
          actualResponse: "",
          evaluation: `Test execution error: ${error instanceof Error ? error.message : String(error)}`,
          score: 0,
        });
      }
    }

    // Calculate overall statistics
    const passed = caseResults.filter((r) => r.result === "pass").length;
    const failed = caseResults.filter((r) => r.result === "fail").length;
    const overallScore = Math.round(
      caseResults.reduce((sum, r) => sum + r.score, 0) / caseResults.length
    );

    // Generate improvement suggestions for failures
    const suggestions = await this.generateSuggestions(
      systemPrompt,
      caseResults.filter((r) => r.result === "fail"),
      judge
    );

    return {
      overallScore,
      passed,
      failed,
      cases: caseResults,
      suggestions,
    };
  }

  /**
   * Builds the prompt for the judge LLM to evaluate a response.
   *
   * The judge prompt provides all necessary context for evaluation:
   * - The original query
   * - Expected behavior
   * - Actual response
   * - Evaluation criteria
   *
   * @param testCase - The test case being evaluated
   * @param actualResponse - The response that was generated
   * @returns The judge prompt
   */
  private buildJudgePrompt(testCase: TestCase, actualResponse: string): string {
    return `You are an expert AI prompt evaluator. Your task is to judge whether an AI assistant's response meets the expected behavior for a given query.

# Query
${testCase.query}

${testCase.context ? `# Context\n${testCase.context}\n\n` : ""}# Expected Behavior
${testCase.expectedBehavior}

# Actual Response
${actualResponse}

# Evaluation Criteria
1. Does the response demonstrate the expected behavior?
2. Is the response appropriate for the query?
3. Are there any significant issues or deviations?

Provide a detailed evaluation with:
- A pass/fail judgment
- A numeric score (0-100) where:
  * 90-100: Excellent, fully meets expectations
  * 70-89: Good, meets most expectations with minor issues
  * 50-69: Acceptable, meets some expectations but has notable problems
  * 30-49: Poor, significant deviation from expected behavior
  * 0-29: Failed, does not meet expected behavior at all
- Specific feedback on what was good or problematic`;
  }

  /**
   * Generates actionable suggestions for improving the prompt based on failures.
   *
   * Analyzes failed test cases and the system prompt to provide specific
   * recommendations for how to modify the prompt to achieve better results.
   *
   * @param systemPrompt - The system prompt being tested
   * @param failures - Test cases that failed
   * @param judgeModel - Model to use for generating suggestions
   * @returns Array of improvement suggestions
   */
  private async generateSuggestions(
    systemPrompt: string,
    failures: TestCaseResult[],
    judgeModel: Parameters<typeof generateText>[0]["model"]
  ): Promise<string[]> {
    if (failures.length === 0) {
      return [];
    }

    const failuresSummary = failures
      .map(
        (f, i) => `
## Failure ${i + 1}
**Query:** ${f.testCase.query}
**Expected:** ${f.testCase.expectedBehavior}
**Actual Response:** ${f.actualResponse}
**Evaluation:** ${f.evaluation}
`
      )
      .join("\n");

    const suggestionPrompt = `You are an expert prompt engineer. Analyze this system prompt and its test failures, then provide specific, actionable suggestions to improve the prompt.

# System Prompt Being Tested
${systemPrompt}

# Failed Test Cases
${failuresSummary}

# Task
Provide 2-5 specific, actionable recommendations for improving the system prompt to address these failures. Focus on:
- Missing sections that would help (examples, constraints, error handling, etc.)
- Unclear or ambiguous instructions
- Missing behavioral guidelines
- Better ways to structure existing content

Each suggestion should be concrete and implementable.`;

    try {
      const response = await generateObject({
        model: judgeModel,
        schema: SuggestionsSchema,
        prompt: suggestionPrompt,
        temperature: 0.3,
      });

      return response.object.suggestions;
    } catch {
      return [
        "Review failed test cases and consider adding more specific examples",
        "Add explicit constraints or guidelines addressing the failure scenarios",
        "Consider adding error handling instructions for edge cases",
      ];
    }
  }
}

/**
 * Creates a new PromptTester instance.
 *
 * @returns A new PromptTester
 */
export function createTester(): PromptTester {
  return new PromptTester();
}

export type {
  TestCase,
  TestCaseResult,
  TestOptions,
  TestResult,
} from "./types";
