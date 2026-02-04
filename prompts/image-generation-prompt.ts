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

  let prompt = `You are a creative director crafting lifestyle brand imagery.

<task>
Generate a detailed image description for an image generation model. Output a single, vivid description of a photograph including:
- Scene setting (environment, lighting, atmosphere, time of day)
- Subject positioning (angles, focal points, composition)
- Visual style (color palette, aesthetic, mood)
- Product integration (naturally within the scene)
- Specific details that bring authenticity

The image should feel like a candid lifestyle moment, not a staged product shot. Prioritize storytelling and emotional connection.
</task>
`;

  prompt += `\n<constraints>
<technical>
- Aspect ratio: 1:1 square (social media optimized)
- Composition: Rule of thirds for balance
- Avoid: Copyrighted elements, identifiable faces, text overlays
- Contrast: Sufficient for accessibility
</technical>

<creative>
- Diverse representation (unless narrow audience specified)
- Candid, relatable scenes (not overly staged)
- Product prominence: 20-40% of visual weight
</creative>
</constraints>
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

<synthesis_task>
Translate these psychological insights into visual elements:
- Settings that resonate with motivations
- Mood and atmosphere aligned with triggers
- Visual style reflecting personality traits
- Color palette evoking emotional response
- Compositions leveraging psychological patterns
</synthesis_task>
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

  prompt += `\n<scene_approach>
Create a lifestyle image showing the product in a real-world setting. The scene should:
- Depict a relatable moment (social gathering, routine, aspiration)
- Feature the product naturally integrated (not isolated)
- Capture brand vibe through environment, lighting, composition
- Tell a visual story connecting product to audience's world
- Feel authentic and candid, not staged
</scene_approach>
`;

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
      prompt += `\n<reference_image_provided>true</reference_image_provided>
<integration_requirements>
- Feature exact product from reference (do not redesign)
- Show naturally in lifestyle scene (not isolated)
- Maintain visual accuracy (colors, materials, proportions)
- Visible and recognizable, but not dominating
</integration_requirements>
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
<note>Real audience conversations (${audienceInsightsCitations.citations.length} sources). Extract authentic contexts and moments.</note>
`;

    audienceInsightsCitations.citations.slice(0, 5).forEach((citation, index) => {
      prompt += `
<citation id="${index + 1}" relevance="${citation.relevance_score}">
<text>${citation.text.slice(0, 200)}${citation.text.length > 200 ? '...' : ''}</text>
<source>${citation.source}${citation.subreddit ? ` (r/${citation.subreddit})` : ''}</source>
<why_relevant>${citation.reason}</why_relevant>
</citation>
`;
    });

    prompt += `</citations>
`;
  }

  prompt += `\n<output_instructions>
Generate a detailed image description synthesizing all inputs above.

Requirements:
- Write as a complete visual description (not meta-instructions)
- Be specific: lighting, composition, colors, mood, details
- Authentically represent brand while resonating with audience
- Natural product integration in lifestyle context
- No mention of platforms, models, or technical processes
</output_instructions>
`;

  return prompt;
}
