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

  let prompt = `<task>Select the best product for lifestyle image generation.</task>

<evaluation_criteria>
Evaluate each product on these dimensions (0-10 scale):

VISUAL POTENTIAL:
- Form: Clear, recognizable shape (not abstract/invisible)
- Color: Distinctive, appealing colors
- Photogenic: Good texture, materials, proportions
- Scene fit: Can integrate naturally into lifestyle scenes

BRAND ALIGNMENT:
- Embodies brand's core values
- Matches brand's visual aesthetic
- Representative of brand positioning

AUDIENCE APPEAL:
- Target audience would use/desire this
- Fits user's brief (if provided)
- Enables aspirational storytelling

SOCIAL SHAREABILITY:
- Visually interesting for social media
- Enables emotional connection
- Stands out in a feed

Select the product with the highest combined score.
</evaluation_criteria>
`;

  if (brandResearch && !("error" in brandResearch) && brandResearch.brand) {
    const brand = brandResearch.brand;
    prompt += `\n<brand>
`;
    if (brand.name) {
      prompt += `<name>${brand.name}</name>
`;
    }
    if (brand.industry) {
      prompt += `<industry>${brand.industry}</industry>
`;
    }
    if (brand.values && brand.values.length > 0) {
      prompt += `<values>${brand.values.join(", ")}</values>
`;
    }
    if (brand.voice) {
      prompt += `<voice>${brand.voice}</voice>
`;
    }
    if (brand.mission) {
      prompt += `<mission>${brand.mission}</mission>
`;
    }
    prompt += `</brand>
`;
  }

  if (brief && brief.trim()) {
    prompt += `\n<brief>${brief.trim()}</brief>
`;
  }

  prompt += `\n<examples>
<example>
<scenario>Minimalist skincare brand choosing between Face Cleanser, Canvas Tote Bag, Serum Gift Set</scenario>
<best_choice>
Product: Serum Gift Set
Scores: Visual 9/10, Brand 9/10, Audience 9/10, Social 10/10
Reasoning: Glass bottles with visible product create visual interest, luxe materials align with premium positioning, perfect for bathroom counter/flat lay lifestyle shots, aspirational self-care storytelling.
</best_choice>
<worst_choice>
Product: Canvas Tote Bag
Scores: Visual 5/10, Brand 6/10, Audience 6/10, Social 5/10
Reasoning: Generic form, less visually distinctive, harder to make stand out, weaker emotional storytelling than hero products.
</worst_choice>
</example>

<example>
<scenario>Adventure gear brand choosing between Hiking Boots, Digital Gift Card, Technical Backpack</scenario>
<best_choice>
Product: Hiking Boots
Scores: Visual 9/10, Brand 10/10, Audience 10/10, Social 9/10
Reasoning: Rich texture and distinctive shape, embodies adventure positioning, perfect for trail scenes and campfire moments, highly photogenic with interesting materials.
</best_choice>
<worst_choice>
Product: Digital Gift Card
Scores: Visual 1/10, Brand 3/10, Audience 2/10, Social 1/10
Reasoning: Intangible with no physical form, impossible to photograph in lifestyle context, no emotional connection or visual interest.
</worst_choice>
</example>
</examples>
`;

  prompt += `\n<products>
`;
  products.forEach((product, index) => {
    prompt += `<product id="${index + 1}">
<name>${product.name}</name>
<category>${product.category}</category>
<description>${product.description}</description>
`;
    if (product.url) {
      prompt += `<url>${product.url}</url>
`;
    }
    prompt += `</product>
`;
  });
  prompt += `</products>

<output_format>
Return your selection as JSON:
{
  "selectedProductName": "exact name from list",
  "reasoning": "2-3 sentence explanation",
  "visualPotentialScore": 0-10,
  "brandAlignmentScore": 0-10,
  "audienceAppealScore": 0-10,
  "socialShareabilityScore": 0-10
}
</output_format>
`;

  return prompt;
}
