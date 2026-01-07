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

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `API error: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}

export async function getBrandDetails(
  options: BrandResearchOptions
): Promise<BrandResearchResponse> {
  return fetchApi<BrandResearchResponse>("/api/brand-research", {
    method: "POST",
    body: JSON.stringify(options),
  });
}

export async function getProducts(
  options: ProductsOptions
): Promise<ProductsResponse> {
  return fetchApi<ProductsResponse>("/api/brand-products", {
    method: "POST",
    body: JSON.stringify(options),
  });
}

export async function getAudienceInsights(
  options: AudienceInsightsOptions
): Promise<AudienceInsightsResponse> {
  return fetchApi<AudienceInsightsResponse>("/api/audience-insights", {
    method: "POST",
    body: JSON.stringify(options),
  });
}

export async function getInsightCitations(
  options: InsightCitationsOptions
): Promise<InsightCitationsResponse> {
  return fetchApi<InsightCitationsResponse>(
    `/api/audience-insights-citations?continuation_token=${encodeURIComponent(
      options.continuation_token
    )}`,
    {
      method: "GET",
    }
  );
}

