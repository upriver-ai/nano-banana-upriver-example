"use server";

import { GoogleGenAI } from "@google/genai";
import type {
  BrandResearchResponse,
  ProductsResponse,
  ProductDetailsResponse,
  AudienceInsightsResponse,
  InsightCitationsResponse,
} from "./upriver-types";

const DEFAULT_MODEL = "gemini-3-flash-preview";

export interface GeneratePromptOptions {
  brandUrl: string;
  additionalInstructions?: string;
  brandResearch: BrandResearchResponse | null;
  products: ProductsResponse | null;
  productDetails: ProductDetailsResponse | null;
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
    productDetails,
    audienceInsights,
    audienceInsightsCitations,
  } = options;

  let prompt = `You are an expert brand strategist and creative director specializing in lifestyle brand imagery and visual storytelling. Your expertise lies in creating compelling, audience-centered visuals that authentically capture brand essence through engaging scenes and contexts.

Your task is to create a detailed image generation prompt for lifestyle brand imagery that tells a visual story. The prompt must:

• Create lifestyle-focused imagery that showcases the brand's world and resonates with the target audience
• When reference images are provided, include the product naturally within engaging scenes
• Balance product visibility with storytelling - the scene should feel authentic, not staged around the product
• Synthesize all available brand context including identity, values, mission, and visual language
• Align with the target audience's preferences, motivations, and psychological triggers
• Depict social moments, use-case scenarios, or aspirational lifestyle scenes
• Reflect the brand's tone, voice, and communication style
• Include specific visual elements, composition guidance, and style direction
• Be clear, detailed, and optimized for image generation AI models
• Prioritize audience connection and brand vibe over product hero shots

Guidelines for the prompt:
• Use descriptive, vivid language that paints a clear visual picture of a lifestyle moment or scene
• Specify composition, lighting, mood, and color palette that embody the brand's vibe
• Include style references (e.g., "modern minimalist", "vibrant and energetic", "sophisticated and elegant")
• Mention any key visual elements, symbols, or motifs that represent the brand
• When reference images are provided, feature the product naturally within the scene - visible and recognizable but integrated authentically
• Focus on the audience's world - their environments, social settings, aspirations, and everyday moments
• Create scenes that tell a story and evoke emotion, not just display a product
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

  // AUDIENCE INSIGHTS FIRST - Who are we creating this for?
  if (audienceInsights && !("error" in audienceInsights)) {
    prompt += `\n## AUDIENCE INSIGHTS (PRIMARY)\n`;
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

  // SCENE & CONTEXT GUIDANCE - What kind of image should this be?
  prompt += `\n## SCENE & CONTEXT\n`;
  prompt += `\nCreate a lifestyle image that:\n`;
  prompt += `• Shows the product in a real-world setting that resonates with the target audience\n`;
  prompt += `• Depicts a social moment, use-case scenario, or aspirational lifestyle scene\n`;
  prompt += `• Uses the product as a natural part of the scene, not as a standalone object\n`;
  prompt += `• Captures the brand's vibe and values through the environment, lighting, and composition\n`;
  prompt += `• Features people, settings, or moments that the audience can relate to or aspire to\n`;
  prompt += `• Tells a visual story that connects the product to the audience's world\n`;
  prompt += `\nExamples of scene types:\n`;
  prompt += `• Social gatherings (friends, family, celebrations)\n`;
  prompt += `• Lifestyle moments (morning routine, weekend activities, self-care)\n`;
  prompt += `• Aspirational settings (travel, adventure, achievement)\n`;
  prompt += `• Everyday contexts (work, home, commute) elevated with brand aesthetics\n\n`;

  // PRODUCT DETAILS - Include the product naturally in the scene
  if (productDetails && !("error" in productDetails)) {
    prompt += `\n## Product Integration\n`;

    if (productDetails.images && productDetails.images.length > 0) {
      prompt += `\nREFERENCE IMAGE PROVIDED\n`;
      prompt += `A reference image showing the actual product has been included with this request.\n\n`;
    }

    prompt += `• Product Name: ${productDetails.name}\n`;
    prompt += `• Visual Description: ${productDetails.description}\n`;

    if (productDetails.features && productDetails.features.length > 0) {
      prompt += `• Product Features: ${productDetails.features.join(", ")}\n`;
    }

    if (productDetails.price) {
      prompt += `• Price: ${productDetails.price}${productDetails.currency ? ` ${productDetails.currency}` : ""}\n`;
    }

    if (productDetails.images && productDetails.images.length > 0) {
      prompt += `\nProduct Guidelines:\n`;
      prompt += `The generated image should feature this specific product from the reference image.\n`;
      prompt += `• Feature the product naturally within the scene - visible and recognizable\n`;
      prompt += `• Do NOT redesign, stylize, or create a different product\n`;
      prompt += `• Do NOT use a generic or simplified version of the product\n`;
      prompt += `• Show the product in use or as part of the lifestyle moment being depicted\n`;
      prompt += `• Match the product's visual appearance, colors, materials, and proportions accurately\n`;
      prompt += `• The product should feel authentic to the scene, not staged as the sole focal point\n`;
      prompt += `• Prioritize the story and scene composition, with the product integrated naturally\n\n`;
    }
  }

  if (products && !("error" in products) && products.products) {
    prompt += `\n## Additional Products\n`;
    if (products.products.length > 0) {
      prompt += `• Product Categories:\n`;
      products.products.slice(0, 10).forEach((product) => {
        prompt += `  - ${product.name} (${product.category}): ${product.description}\n`;
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

  prompt += `\nNow, create a comprehensive image generation prompt that synthesizes all of this information. The prompt should be detailed, visually descriptive, and optimized for generating a lifestyle image that authentically represents this brand while resonating with its target audience.`;

  // Add specific instruction if product images are present
  if (productDetails && productDetails.images && productDetails.images.length > 0) {
    prompt += ` CRITICAL: Create a compelling scene that embodies the brand's vibe and resonates with the target audience. The product from the reference image should appear naturally within this scene - visible and recognizable, but integrated authentically rather than staged as the sole focal point. Prioritize storytelling and audience connection over product hero shots.`;
  }

  prompt += ` Remember: do not mention any specific image generation models or platforms - focus solely on the visual description and artistic direction.`;

  return prompt;
}

export async function generateImagePrompt(
  options: GeneratePromptOptions,
  apiKey?: string
): Promise<GeneratePromptResult> {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not set. Please provide an API key in settings or set the environment variable.");
  }

  const ai = new GoogleGenAI({ apiKey: key });
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
