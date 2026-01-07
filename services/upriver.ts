import type {
  BrandResearchOptions,
  BrandResearchResponse,
  ProductsOptions,
  ProductsResponse,
  AudienceInsightsOptions,
  AudienceInsightsResponse,
  InsightCitationsOptions,
  InsightCitationsResponse,
} from "./upriver-types";

const UPRIVER_API_BASE = "https://api.upriver.ai";

function getApiKey(): string {
  const apiKey = process.env.UPRIVER_API_KEY;
  if (!apiKey) {
    throw new Error("UPRIVER_API_KEY is not set in environment variables");
  }
  return apiKey;
}

async function fetchUpriver<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const apiKey = getApiKey();
  const url = `${UPRIVER_API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Upriver API error: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return response.json();
}

export async function getBrandDetails(
  options: BrandResearchOptions
): Promise<BrandResearchResponse> {
  return fetchUpriver<BrandResearchResponse>("/v2/brand/research", {
    method: "POST",
    body: JSON.stringify({
      response_format: "json",
      effort: "auto",
      ...options,
    }),
  });
}

export async function getProducts(
  options: ProductsOptions
): Promise<ProductsResponse> {
  return fetchUpriver<ProductsResponse>("/v1/brand/products", {
    method: "POST",
    body: JSON.stringify({
      response_format: "json",
      effort: "auto",
      ...options,
    }),
  });
}

export async function getAudienceInsights(
  options: AudienceInsightsOptions
): Promise<AudienceInsightsResponse> {
  return fetchUpriver<AudienceInsightsResponse>("/v2/audience_insights", {
    method: "POST",
    body: JSON.stringify({
      citations_mode: "async",
      ...options,
    }),
  });
}

export async function getInsightCitations(
  options: InsightCitationsOptions
): Promise<InsightCitationsResponse> {
  return fetchUpriver<InsightCitationsResponse>(
    `/v2/audience_insights/${options.continuation_token}/citations`,
    {
      method: "GET",
    }
  );
}
