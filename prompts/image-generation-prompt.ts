/**
 * Image Generation Prompt Builder
 *
 * This function builds the prompt used to generate image generation instructions
 * based on brand research, audience insights, and product information.
 *
 * CUSTOMIZATION POINTS:
 * - System role and expertise (lines 40-66): Defines the AI's perspective and approach
 * - Audience insights emphasis (lines 78-116): Controls how audience data is incorporated
 * - Brand research integration (lines 118-153): Defines what brand info to include
 * - Scene guidance (lines 156-168): Sets the type and style of lifestyle scenes
 * - Product integration (lines 171-201): Controls how products are featured in scenes
 *
 * @param options - Configuration object containing brand data and instructions
 * @returns Complete prompt string for Gemini to generate an image prompt
 */

import type {
  BrandResearchResponse,
  ProductsResponse,
  ProductDetailsResponse,
  AudienceInsightsResponse,
  InsightCitationsResponse,
} from "@/services/upriver-types";

export interface GeneratePromptOptions {
  brandUrl: string;
  additionalInstructions?: string;
  brandResearch: BrandResearchResponse | null;
  products: ProductsResponse | null;
  productDetails: ProductDetailsResponse | null;
  audienceInsights: AudienceInsightsResponse | null;
  audienceInsightsCitations: InsightCitationsResponse | null;
}

export function buildImageGenerationPrompt(options: GeneratePromptOptions): string {
  const {
    brandUrl,
    additionalInstructions,
    brandResearch,
    products,
    productDetails,
    audienceInsights,
    audienceInsightsCitations,
  } = options;

  let prompt = `Generate a detailed image description for a lifestyle photograph - a candid moment where the product is naturally present, not a staged product shot.

<approach>
Prioritize: scene/vibe → person/activity → environment/lighting → product (subtle detail)

Create documentary-style imagery:
- One or more people (solo moments or groups - choose what fits the scene)
- Mid-action, genuine emotion, not camera-aware
- Lived-in environments with natural imperfections
- Organic lighting with shadows (not flat/studio)
- Off-center composition, cropped elements
- Product small in frame (10-25% max), background/mid-ground only

Think: lifestyle editorial capturing real life, not e-commerce photoshoot.
</approach>

<technical>
1:1 square. Rule of thirds. Avoid: identifiable faces, copyrighted elements, text, centered/symmetrical staging.
</technical>
`;

  // BRAND URL & ADDITIONAL INSTRUCTIONS
  if (brandUrl && brandUrl.trim()) {
    prompt += `\nBrand URL: ${brandUrl}\n`;
  } else {
    prompt += `\nNote: No brand URL provided. Generate a prompt based on the additional instructions and any available context.\n`;
  }

  if (additionalInstructions && additionalInstructions.trim()) {
    prompt += `\nAdditional Instructions: ${additionalInstructions.trim()}\n`;
  }

  if (audienceInsights && !("error" in audienceInsights)) {
    prompt += `\n<audience>
`;

    if (audienceInsights.rollup_summary) {
      prompt += `<summary>${audienceInsights.rollup_summary}</summary>
`;
    }

    if (audienceInsights.personas && audienceInsights.personas.length > 0) {
      prompt += `\n<personas>
`;

      audienceInsights.personas.slice(0, 3).forEach((persona) => {
        prompt += `<persona>
<label>${persona.label}</label>
<description>${persona.description}</description>
`;

        if (persona.psychology) {
          prompt += `<psychology>
`;
          if (persona.psychology.motivations && persona.psychology.motivations.length > 0) {
            prompt += `<motivations>${persona.psychology.motivations.slice(0, 4).join(", ")}</motivations>
`;
          }
          if (persona.psychology.triggers && persona.psychology.triggers.length > 0) {
            prompt += `<triggers>${persona.psychology.triggers.slice(0, 4).join(", ")}</triggers>
`;
          }
          if (persona.psychology.barriers && persona.psychology.barriers.length > 0) {
            prompt += `<barriers>${persona.psychology.barriers.slice(0, 3).join(", ")}</barriers>
`;
          }
          prompt += `</psychology>
`;
        }

        if (persona.personality_traits && persona.personality_traits.length > 0) {
          const traits = persona.personality_traits.slice(0, 3).map(t => t.trait).join(", ");
          prompt += `<traits>${traits}</traits>
`;
        }

        if (persona.language_patterns?.tone_descriptors && persona.language_patterns.tone_descriptors.length > 0) {
          prompt += `<tone>${persona.language_patterns.tone_descriptors.slice(0, 3).join(", ")}</tone>
`;
        }

        prompt += `</persona>
`;
      });

      prompt += `</personas>

<synthesis_task>Translate psychology → visuals: settings from motivations, mood from triggers, style from traits.</synthesis_task>
`;
    }

    prompt += `</audience>
`;
  }

  if (brandResearch && !("error" in brandResearch)) {
    prompt += `\n<brand>
`;
    if (brandResearch.brand) {
      const brand = brandResearch.brand;

      if (brand.name) {
        prompt += `<name>${brand.name}</name>
`;
      }
      if (brand.industry) {
        prompt += `<industry>${brand.industry}</industry>
`;
      }
      if (brand.mission) {
        prompt += `<mission>${brand.mission}</mission>
`;
      }
      if (brand.tagline) {
        prompt += `<tagline>${brand.tagline}</tagline>
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
      if (brand.identity?.language?.tone) {
        prompt += `<tone>${brand.identity.language.tone}</tone>
`;
      }
      if (brand.identity?.language?.key_phrases && brand.identity.language.key_phrases.length > 0) {
        prompt += `<key_themes>${brand.identity.language.key_phrases.slice(0, 3).join(", ")}</key_themes>
`;
      }
      if (brand.target_audience || brandResearch.audience?.description) {
        prompt += `<target_audience>${brand.target_audience || brandResearch.audience?.description}</target_audience>
`;
      }
    }

    prompt += `</brand>
`;
  }


  if (productDetails && !("error" in productDetails)) {
    prompt += `\n<product>
<name>${productDetails.name}</name>
<description>${productDetails.description}</description>
`;

    if (productDetails.features && productDetails.features.length > 0) {
      prompt += `<features>${productDetails.features.slice(0, 5).join(", ")}</features>
`;
    }

    if (productDetails.price) {
      prompt += `<price>${productDetails.price}${productDetails.currency ? ` ${productDetails.currency}` : ""}</price>
`;
    }

    if (productDetails.images && productDetails.images.length > 0) {
      prompt += `\n<reference_image>Use exact product from reference. Place small in background/mid-ground, naturally integrated (being used casually or nearby). Maintain accuracy but keep subtle - scene works without it.</reference_image>
`;
    }

    prompt += `</product>
`;
  }

  if (products && !("error" in products) && products.products && products.products.length > 0) {
    prompt += `\n<brand_catalog>
`;
    products.products.slice(0, 8).forEach((product) => {
      prompt += `<item>${product.name} (${product.category})</item>
`;
    });
    prompt += `</brand_catalog>
`;
  }

  if (
    audienceInsightsCitations &&
    !("error" in audienceInsightsCitations) &&
    audienceInsightsCitations.citations &&
    audienceInsightsCitations.citations.length > 0
  ) {
    prompt += `\n<citations>
Real audience conversations - extract authentic contexts:
`;

    audienceInsightsCitations.citations.slice(0, 3).forEach((citation) => {
      prompt += `"${citation.text.slice(0, 150)}${citation.text.length > 150 ? '...' : ''}" (${citation.source})
`;
    });

    prompt += `</citations>
`;
  }

  prompt += `\n<output>
Write a detailed visual description. Start with scene/person/action, then environment/lighting, finally product placement.

Example style (solo): "A designer sketches at a sunlit desk, hair tied back messily, surrounded by inspiration boards and sample materials. Morning light creates strong shadows across the workspace. Their laptop sits half-open in the background, barely visible."

Example style (group): "Two friends laugh mid-conversation at a cluttered cafe table, afternoon sunlight streaming through windows. One gestures animatedly, the other leans back relaxed. A laptop sits forgotten at the table's edge among coffee cups."

Be specific about lighting, composition, mood. Lead with lifestyle, not product. Include natural imperfections and candid qualities. Choose solo or group based on what feels authentic for the brand moment.
</output>
`;

  return prompt;
}
