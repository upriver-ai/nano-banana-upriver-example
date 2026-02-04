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

export interface SelectProductResult {
  selectedProduct: ProductInfo;
  reasoning?: string;
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

    const selectedProductName =
      response.candidates?.[0]?.content?.parts
        ?.map((part) => {
          if ("text" in part) {
            return part.text;
          }
          return "";
        })
        .join("")
        .trim() || "";

    if (!selectedProductName) {
      throw new Error("No product name returned from AI selection");
    }

    // Find matching product (case-insensitive)
    const selectedProduct = products.find(
      (p) => p.name.toLowerCase() === selectedProductName.toLowerCase()
    );

    if (!selectedProduct) {
      // Try fuzzy matching - check if the returned name is contained in any product name
      const fuzzyMatch = products.find(
        (p) =>
          p.name.toLowerCase().includes(selectedProductName.toLowerCase()) ||
          selectedProductName.toLowerCase().includes(p.name.toLowerCase())
      );

      if (fuzzyMatch) {
        return {
          selectedProduct: fuzzyMatch,
          reasoning: `AI selected: ${selectedProductName} (matched to ${fuzzyMatch.name})`,
        };
      }

      throw new Error(
        `AI selected product "${selectedProductName}" not found in products list`
      );
    }

    return {
      selectedProduct,
      reasoning: `AI selected: ${selectedProductName}`,
    };
  } catch (err) {
    throw new Error(
      `Product selection failed: ${err instanceof Error ? err.message : "Unknown error"}`
    );
  }
}
