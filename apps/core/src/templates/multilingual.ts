import type { SystemPromptBuilder } from "@/builder";
import { createPromptBuilder } from "@/builder";

/**
 * Configuration options for the multilingual template.
 */
export type MultilingualConfig = {
  /**
   * Supported languages (optional).
   * @example ["English", "Spanish", "French"]
   */
  supportedLanguages?: string[];

  /**
   * Default language if user's language is unclear (optional).
   * @default "English"
   */
  defaultLanguage?: string;

  /**
   * Whether to auto-detect language (optional).
   * @default true
   */
  autoDetect?: boolean;
};

/**
 * Creates a multilingual support template for composition with other prompts.
 *
 * This template provides best practices for handling multiple languages,
 * including language detection, response formatting, and cultural considerations.
 *
 * **Key Features:**
 * - Automatic language detection
 * - Consistent responses in user's language
 * - Cultural sensitivity
 * - Translation quality guidelines
 *
 * This template is designed to be merged with domain-specific prompts:
 *
 * @param config - Configuration for multilingual support
 * @returns A configured SystemPromptBuilder with multilingual features
 *
 * @example
 * ```typescript
 * import { multilingual } from "promptsmith-ts/templates";
 * import { createPromptBuilder } from "promptsmith-ts/builder";
 *
 * // Create your domain-specific prompt
 * const myPrompt = createPromptBuilder()
 *   .withIdentity("You are a customer service assistant")
 *   .withCapabilities(["Answer questions", "Resolve issues"]);
 *
 * // Add multilingual support
 * const multilingualPrompt = myPrompt.merge(
 *   templates.multilingual({
 *     supportedLanguages: ["English", "Spanish", "French"],
 *     defaultLanguage: "English"
 *   })
 * );
 * ```
 */
export function multilingual(
  config: MultilingualConfig = {}
): SystemPromptBuilder {
  const {
    supportedLanguages,
    defaultLanguage = "English",
    autoDetect = true,
  } = config;

  let contextStr = "";
  if (supportedLanguages && supportedLanguages.length > 0) {
    contextStr = `Supported Languages: ${supportedLanguages.join(", ")}\nDefault Language: ${defaultLanguage}`;
  } else {
    contextStr = `Default Language: ${defaultLanguage}`;
  }

  const builder = createPromptBuilder()
    .withContext(contextStr)
    .withCapabilities([
      "Detect and respond in the user's preferred language",
      "Maintain consistent terminology across languages",
      "Adapt communication style to cultural context",
    ]);

  if (autoDetect) {
    builder
      .withConstraint(
        "must",
        "Automatically detect the language of the user's message and respond in the same language"
      )
      .withConstraint(
        "must",
        `If language cannot be detected, default to ${defaultLanguage}`
      );
  }

  builder
    .withConstraint(
      "must",
      "Maintain the same level of formality as the user's message"
    )
    .withConstraint(
      "must",
      "Use culturally appropriate expressions and avoid idioms that don't translate well"
    )
    .withConstraint(
      "must_not",
      "Never mix languages within a single response unless explicitly asked"
    )
    .withConstraint(
      "must_not",
      "Never make assumptions about user preferences based on their language"
    )
    .withConstraint(
      "should",
      "Adapt date, time, number, and currency formats to the user's region"
    )
    .withConstraint(
      "should",
      "Use inclusive and respectful language appropriate for the culture"
    )
    .withConstraint(
      "should",
      "Offer to switch languages if the user struggles or asks"
    )
    .withConstraint(
      "should_not",
      "Don't use machine-translation-style language; aim for natural, fluent communication"
    )
    .withExamples([
      {
        user: "Hola, ¿cómo estás?",
        assistant: "¡Hola! Estoy bien, gracias. ¿En qué puedo ayudarte hoy?",
        explanation:
          "Detect Spanish and respond naturally in Spanish with appropriate formality",
      },
      {
        user: "Bonjour, je voudrais obtenir de l'aide",
        assistant:
          "Bonjour! Je serais ravi de vous aider. Quelle est votre question?",
        explanation:
          "Detect French and respond with appropriate formality (vous instead of tu for professional context)",
      },
    ])
    .withErrorHandling(
      `
Language Handling Guidelines:
- If you detect a language you cannot respond in fluently, politely inform the user and offer supported languages
- If the user switches languages mid-conversation, seamlessly switch to the new language
- If a technical term has no good translation, use the English term with a brief explanation
- For language-specific content (puns, wordplay, cultural references), either adapt appropriately or explain that it doesn't translate well
    `.trim()
    );

  return builder;
}
