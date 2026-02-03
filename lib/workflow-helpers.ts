import type {
  AudienceInsightsOptions,
  AudienceInsightsResponse,
  BrandResearchResponse,
  ProductsResponse,
} from "@/services/upriver-types";

export function buildAudienceInsightsPayload(
  brandResearch: BrandResearchResponse | null,
  products: ProductsResponse | null,
  briefValue: string
): AudienceInsightsOptions {
  const defaultBrief = "a campaign that raises brand awareness";
  const briefToUse = briefValue.trim() || defaultBrief;

  const payload: AudienceInsightsOptions = {
    brief: briefToUse,
  };

  if (brandResearch) {
    if (brandResearch.brand) {
      payload.brand = {
        voice: brandResearch.brand.voice,
        values: brandResearch.brand.values,
      };
    }

    if (brandResearch.industries) {
      payload.industries = brandResearch.industries;
    } else if (brandResearch.brand?.industry) {
      payload.industries = [brandResearch.brand.industry];
    }

    if (brandResearch.audience?.description) {
      payload.audience = { description: brandResearch.audience.description };
    }
  }

  if (products && products.products && products.products.length > 0) {
    payload.products = products.products.map((product) => ({
      category: product.category,
      name: product.name,
      description: product.description,
    }));
  }

  return payload;
}

export function extractContinuationToken(
  audienceInsightsData: AudienceInsightsResponse | null
): string | null {
  if (!audienceInsightsData) {
    return null;
  }

  const data = audienceInsightsData;

  if (
    data.meta &&
    typeof data.meta === "object" &&
    "continuation_token" in data.meta &&
    data.meta.continuation_token
  ) {
    return data.meta.continuation_token;
  }

  if ("continuation_token" in data && data.continuation_token) {
    return data.continuation_token;
  }

  return null;
}

/**
 * Normalizes a partial domain into a well-formed URL.
 *
 * Examples:
 * - "olipop.com" → "https://olipop.com"
 * - "www.nike.com" → "https://www.nike.com"
 * - "halfpricedrapes.com" → "https://halfpricedrapes.com"
 * - "https://example.com" → "https://example.com" (unchanged)
 * - "http://example.com" → "https://example.com" (upgraded to https)
 */
export function normalizeBrandUrl(input: string): string {
  const trimmed = input.trim();

  if (!trimmed) {
    return trimmed;
  }

  // Already has https:// protocol
  if (trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Has http:// protocol - upgrade to https
  if (trimmed.startsWith("http://")) {
    return trimmed.replace("http://", "https://");
  }

  // Remove leading // or www. patterns
  let domain = trimmed;
  if (domain.startsWith("//")) {
    domain = domain.substring(2);
  }

  // Add https:// prefix
  return `https://${domain}`;
}
