"use server";

import { GoogleGenAI } from "@google/genai";
import type {
  BrandResearchResponse,
  ProductsResponse,
  AudienceInsightsResponse,
  InsightCitationsResponse,
} from "./upriver-types";

const DEFAULT_MODEL = "gemini-3-flash-preview";

export interface GeneratePromptOptions {
  brandUrl: string;
  additionalInstructions?: string;
  brandResearch: BrandResearchResponse | null;
  products: ProductsResponse | null;
  audienceInsights: AudienceInsightsResponse | null;
  audienceInsightsCitations: InsightCitationsResponse | null;
}

export interface GeneratePromptResult {
  prompt: string;
}

function buildPromptTemplate(options: GeneratePromptOptions): string {
  const {
    brandUrl,
    additionalInstructions,
    brandResearch,
    products,
    audienceInsights,
    audienceInsightsCitations,
  } = options;

  let prompt = `You are an expert brand strategist and creative director specializing in visual brand communication. Your expertise lies in synthesizing complex brand data into compelling, actionable image generation prompts.

Your task is to create a detailed, comprehensive image generation prompt that will be used to generate a visual representation of a brand. The prompt must:

• Synthesize all available brand context including identity, values, mission, and visual language
• Incorporate product information and brand offerings when available
• Align with the target audience's preferences, motivations, and psychological triggers
• Reflect the brand's tone, voice, and communication style
• Include specific visual elements, composition guidance, and style direction
• Be clear, detailed, and optimized for image generation AI models
• Balance creative vision with brand authenticity

Guidelines for the prompt:
• Use descriptive, vivid language that paints a clear visual picture
• Specify composition, lighting, mood, and color palette when relevant
• Include style references (e.g., "modern minimalist", "vibrant and energetic", "sophisticated and elegant")
• Mention any key visual elements, symbols, or motifs that represent the brand
• Consider the audience's perspective and what would resonate with them
• Ensure the prompt is self-contained and doesn't require additional context
• Do NOT mention specific image generation models, platforms, or tools (e.g., Midjourney, DALL-E, Stable Diffusion, etc.)
• Focus purely on the visual description and artistic direction
`;

  if (brandUrl && brandUrl.trim()) {
    prompt += `\nBrand URL: ${brandUrl}\n`;
  } else {
    prompt += `\nNote: No brand URL provided. Generate a prompt based on the additional instructions and any available context.\n`;
  }

  if (additionalInstructions && additionalInstructions.trim()) {
    prompt += `\nAdditional Instructions: ${additionalInstructions.trim()}\n`;
  }

  if (brandResearch && !("error" in brandResearch)) {
    prompt += `\n## Brand Research\n`;
    if (brandResearch.brand) {
      const brand = brandResearch.brand;
      prompt += `• Brand Name: ${brand.name || "N/A"}\n`;
      prompt += `• Industry: ${brand.industry || "N/A"}\n`;
      prompt += `• Mission: ${brand.mission || "N/A"}\n`;
      prompt += `• Tagline: ${brand.tagline || "N/A"}\n`;
      prompt += `• Voice: ${brand.voice || "N/A"}\n`;
      if (brand.values && brand.values.length > 0) {
        prompt += `• Core Values: ${brand.values.join(", ")}\n`;
      }
      if (brand.target_audience) {
        prompt += `• Target Audience: ${brand.target_audience}\n`;
      }
      if (brand.identity) {
        prompt += `• Brand Identity:\n`;
        if (brand.identity.language) {
          prompt += `  - Tone: ${brand.identity.language.tone || "N/A"}\n`;
          if (
            brand.identity.language.key_phrases &&
            brand.identity.language.key_phrases.length > 0
          ) {
            prompt += `  - Key Phrases: ${brand.identity.language.key_phrases.join(
              ", "
            )}\n`;
          }
        }
      }
    }
    if (brandResearch.audience) {
      prompt += `• Audience Description: ${
        brandResearch.audience.description || "N/A"
      }\n`;
    }
  }

  if (products && !("error" in products) && products.products) {
    prompt += `\n## Products\n`;
    if (products.products.length > 0) {
      prompt += `• Product Categories:\n`;
      products.products.slice(0, 10).forEach((product) => {
        prompt += `  - ${product.name} (${product.category}): ${product.description}\n`;
      });
    }
  }

  if (audienceInsights && !("error" in audienceInsights)) {
    prompt += `\n## Audience Insights\n`;
    if (audienceInsights.rollup_summary) {
      prompt += `• Summary: ${audienceInsights.rollup_summary}\n`;
    }
    if (audienceInsights.personas && audienceInsights.personas.length > 0) {
      prompt += `• Key Personas:\n`;
      audienceInsights.personas.slice(0, 3).forEach((persona) => {
        prompt += `  - ${persona.label}: ${persona.description}\n`;
        if (persona.psychology) {
          if (
            persona.psychology.motivations &&
            persona.psychology.motivations.length > 0
          ) {
            prompt += `    Motivations: ${persona.psychology.motivations
              .slice(0, 3)
              .join(", ")}\n`;
          }
          if (
            persona.psychology.triggers &&
            persona.psychology.triggers.length > 0
          ) {
            prompt += `    Triggers: ${persona.psychology.triggers
              .slice(0, 3)
              .join(", ")}\n`;
          }
        }
        if (
          persona.language_patterns?.tone_descriptors &&
          persona.language_patterns.tone_descriptors.length > 0
        ) {
          prompt += `    Preferred Tone: ${persona.language_patterns.tone_descriptors
            .slice(0, 3)
            .join(", ")}\n`;
        }
      });
    }
  }

  if (
    audienceInsightsCitations &&
    !("error" in audienceInsightsCitations) &&
    audienceInsightsCitations.citations
  ) {
    prompt += `\n## Supporting Evidence\n`;
    prompt += `• Found ${audienceInsightsCitations.citations.length} relevant citations from audience research\n`;
  }

  prompt += `\nNow, create a comprehensive image generation prompt that synthesizes all of this information. The prompt should be detailed, visually descriptive, and optimized for generating an image that authentically represents this brand while resonating with its target audience. Remember: do not mention any specific image generation models or platforms - focus solely on the visual description and artistic direction.`;

  return prompt;
}

export async function generateImagePrompt(
  options: GeneratePromptOptions
): Promise<GeneratePromptResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = DEFAULT_MODEL;

  const prompt = buildPromptTemplate(options);

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  const generatedText =
    response.candidates?.[0]?.content?.parts
      ?.map((part) => {
        if ("text" in part) {
          return part.text;
        }
        return "";
      })
      .join("") || "";

  if (!generatedText.trim()) {
    throw new Error("No text generated from Gemini");
  }

  return {
    prompt: generatedText.trim(),
  };
}
