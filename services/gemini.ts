"use server";

import { GoogleGenAI } from "@google/genai";
import type {
  BrandResearchResponse,
  ProductsResponse,
  ProductDetailsResponse,
  AudienceInsightsResponse,
  InsightCitationsResponse,
  ProductInfo,
} from "./upriver-types";
import { buildImageGenerationPrompt } from "@/prompts/image-generation-prompt";
import { buildProductSelectionPrompt } from "@/prompts/product-selection-prompt";

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

/**
 * Builds the prompt template for image generation.
 *
 * This function delegates to the extracted prompt builder in the /prompts folder.
 * To customize the prompt, edit /prompts/image-generation-prompt.ts
 */
function buildPromptTemplate(options: GeneratePromptOptions): string {
  return buildImageGenerationPrompt(options);
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

export interface SelectProductOptions {
  products: ProductInfo[];
  brandResearch: BrandResearchResponse | null;
  brief?: string;
}

export interface ProductSelectionScores {
  visualPotential: number;
  brandAlignment: number;
  audienceAppeal: number;
  socialShareability: number;
}

export interface SelectProductResult {
  selectedProduct: ProductInfo;
  reasoning: string;
  scores?: ProductSelectionScores;
}

export async function selectProduct(
  options: SelectProductOptions,
  apiKey?: string
): Promise<SelectProductResult> {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not set. Please provide an API key in settings or set the environment variable.");
  }

  const { products, brandResearch, brief } = options;

  if (products.length === 0) {
    throw new Error("No products available for selection");
  }

  // If only one product, no need for LLM selection
  if (products.length === 1) {
    return {
      selectedProduct: products[0],
      reasoning: "Only one product available",
    };
  }

  const ai = new GoogleGenAI({ apiKey: key });
  const model = DEFAULT_MODEL;

  // Build the selection prompt using extracted prompt builder
  // To customize the prompt, edit /prompts/product-selection-prompt.ts
  const prompt = buildProductSelectionPrompt({ products, brandResearch, brief });

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    const responseText =
      response.candidates?.[0]?.content?.parts
        ?.map((part) => {
          if ("text" in part) {
            return part.text;
          }
          return "";
        })
        .join("")
        .trim() || "";

    if (!responseText) {
      throw new Error("No response returned from AI selection");
    }

    // Parse JSON response
    let selectionData: {
      selectedProductName: string;
      reasoning: string;
      visualPotentialScore?: number;
      brandAlignmentScore?: number;
      audienceAppealScore?: number;
      socialShareabilityScore?: number;
    };

    try {
      // Extract JSON if wrapped in code blocks
      const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : responseText;
      selectionData = JSON.parse(jsonText);
    } catch (parseError) {
      // Fallback: treat as plain text product name (backward compatibility)
      const selectedProduct = products.find(
        (p) => p.name.toLowerCase() === responseText.toLowerCase()
      );

      if (selectedProduct) {
        return {
          selectedProduct,
          reasoning: "Selected by AI (legacy format)",
        };
      }

      throw new Error(
        `Failed to parse AI response as JSON: ${parseError instanceof Error ? parseError.message : "Unknown error"}. Response: ${responseText}`
      );
    }

    if (!selectionData.selectedProductName) {
      throw new Error("AI response missing selectedProductName field");
    }

    // Find matching product (case-insensitive)
    const selectedProduct = products.find(
      (p) => p.name.toLowerCase() === selectionData.selectedProductName.toLowerCase()
    );

    if (!selectedProduct) {
      // Try fuzzy matching - check if the returned name is contained in any product name
      const fuzzyMatch = products.find(
        (p) =>
          p.name.toLowerCase().includes(selectionData.selectedProductName.toLowerCase()) ||
          selectionData.selectedProductName.toLowerCase().includes(p.name.toLowerCase())
      );

      if (fuzzyMatch) {
        return {
          selectedProduct: fuzzyMatch,
          reasoning: selectionData.reasoning || `AI selected: ${selectionData.selectedProductName} (matched to ${fuzzyMatch.name})`,
          scores: {
            visualPotential: selectionData.visualPotentialScore || 0,
            brandAlignment: selectionData.brandAlignmentScore || 0,
            audienceAppeal: selectionData.audienceAppealScore || 0,
            socialShareability: selectionData.socialShareabilityScore || 0,
          },
        };
      }

      throw new Error(
        `AI selected product "${selectionData.selectedProductName}" not found in products list. Available products: ${products.map(p => p.name).join(", ")}`
      );
    }

    return {
      selectedProduct,
      reasoning: selectionData.reasoning || `AI selected: ${selectionData.selectedProductName}`,
      scores: {
        visualPotential: selectionData.visualPotentialScore || 0,
        brandAlignment: selectionData.brandAlignmentScore || 0,
        audienceAppeal: selectionData.audienceAppealScore || 0,
        socialShareability: selectionData.socialShareabilityScore || 0,
      },
    };
  } catch (err) {
    throw new Error(
      `Product selection failed: ${err instanceof Error ? err.message : "Unknown error"}`
    );
  }
}
