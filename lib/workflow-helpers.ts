import type {
  BrandResearchResponse,
  ProductsResponse,
  AudienceInsightsResponse,
  AudienceInsightsOptions,
} from "@/services/upriver-types";

export function buildAudienceInsightsPayload(
  brandResearch: unknown,
  products: unknown,
  briefValue: string
): AudienceInsightsOptions {
  const defaultBrief = "a campaign that raises brand awareness";
  const briefToUse = briefValue.trim() || defaultBrief;

  const payload: AudienceInsightsOptions = {
    brief: briefToUse,
  };

  if (
    brandResearch &&
    typeof brandResearch === "object" &&
    !("error" in brandResearch) &&
    "brand" in brandResearch
  ) {
    const research = brandResearch as BrandResearchResponse;

    if (research.brand) {
      payload.brand = {
        voice: research.brand.voice,
        values: research.brand.values,
      };
    }

    if (research.industries) {
      payload.industries = research.industries;
    } else if (research.brand?.industry) {
      payload.industries = [research.brand.industry];
    }

    if (research.audience?.description) {
      payload.audience = { description: research.audience.description };
    }
  }

  if (
    products &&
    typeof products === "object" &&
    !("error" in products) &&
    "products" in products
  ) {
    const productsData = products as ProductsResponse;
    if (productsData.products && productsData.products.length > 0) {
      (payload as any).products = productsData.products.map((product) => ({
        category: product.category,
        name: product.name,
        description: product.description,
      }));
    }
  }

  return payload;
}

export function extractContinuationToken(
  audienceInsightsData: unknown
): string | null {
  if (!audienceInsightsData || typeof audienceInsightsData !== "object") {
    return null;
  }

  const data = audienceInsightsData as AudienceInsightsResponse;

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

