/**
 * Product Selection Prompt Builder
 *
 * This function builds the prompt used to intelligently select which product
 * to feature in lifestyle imagery based on visual potential and brand alignment.
 *
 * CUSTOMIZATION POINTS:
 * - Selection criteria (lines 40-50): Adjust what factors matter most
 * - Brand context inclusion (lines 53-68): Control what brand info influences selection
 * - Output instructions (lines 88-89): Modify how the AI returns the selection
 *
 * @param products - List of available products to choose from
 * @param brandResearch - Brand identity and positioning data
 * @param brief - Optional user instructions for image generation
 * @returns Complete prompt string for Gemini to select a product
 */

import type {
  BrandResearchResponse,
  ProductInfo,
} from "@/services/upriver-types";

export interface SelectProductOptions {
  products: ProductInfo[];
  brandResearch: BrandResearchResponse | null;
  brief?: string;
}

export function buildProductSelectionPrompt(options: SelectProductOptions): string {
  const { products, brandResearch, brief } = options;

  // SYSTEM ROLE & SELECTION CRITERIA
  // Customize this section to change what factors matter most in product selection
  let prompt = `You are selecting the best product for lifestyle image generation.

Your task is to analyze the available products and select the one that:
• Has the most visual potential for lifestyle imagery (looks good in photos, photogenic)
• Best aligns with the brand's vibe, values, and identity
• Fits the user's brief or additional instructions if provided
• Would create the most engaging and shareable social media content
• Works well in a lifestyle scene (not too abstract, has clear visual form)

`;

  // BRAND CONTEXT
  // Customize this section to emphasize different brand attributes
  if (brandResearch && !("error" in brandResearch) && brandResearch.brand) {
    const brand = brandResearch.brand;
    prompt += `## Brand Context\n`;
    prompt += `• Brand: ${brand.name || "N/A"}\n`;
    prompt += `• Industry: ${brand.industry || "N/A"}\n`;
    if (brand.values && brand.values.length > 0) {
      prompt += `• Core Values: ${brand.values.join(", ")}\n`;
    }
    if (brand.voice) {
      prompt += `• Brand Voice: ${brand.voice}\n`;
    }
    if (brand.mission) {
      prompt += `• Mission: ${brand.mission}\n`;
    }
    prompt += `\n`;
  }

  // USER BRIEF
  if (brief && brief.trim()) {
    prompt += `## User Brief\n${brief.trim()}\n\n`;
  }

  // AVAILABLE PRODUCTS LIST
  prompt += `## Available Products\n\n`;
  products.forEach((product, index) => {
    prompt += `${index + 1}. ${product.name}\n`;
    prompt += `   Category: ${product.category}\n`;
    prompt += `   Description: ${product.description}\n`;
    if (product.url) {
      prompt += `   URL: ${product.url}\n`;
    }
    prompt += `\n`;
  });

  // FINAL SELECTION INSTRUCTIONS
  // Customize output format here if needed
  prompt += `\nBased on the brand context, user brief, and product information above, select the product with the best visual potential for lifestyle imagery.\n\n`;
  prompt += `Return ONLY the exact product name from the list above. Do not include the number, category, or any other text - just the product name exactly as it appears.`;

  return prompt;
}
