"use server";

import type {
  BrandResearchOptions,
  BrandResearchResponse,
  ProductsOptions,
  ProductsResponse,
  AudienceInsightsOptions,
  AudienceInsightsResponse,
  InsightCitationsOptions,
  InsightCitationsResponse,
  ProductDetailsOptions,
  ProductDetailsResponse,
} from "./upriver-types";

const UPRIVER_API_BASE = "https://api.upriver.ai";

function getApiKey(providedKey?: string): string {
  const apiKey = providedKey || process.env.UPRIVER_API_KEY;
  if (!apiKey) {
    throw new Error("UPRIVER_API_KEY is not set. Please provide an API key in settings or set the environment variable.");
  }
  return apiKey;
}

async function fetchUpriver<T>(
  endpoint: string,
  options: RequestInit = {},
  apiKey?: string
): Promise<T> {
  const key = getApiKey(apiKey);
  const url = `${UPRIVER_API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": key,
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
  options: BrandResearchOptions,
  apiKey?: string
): Promise<BrandResearchResponse> {
  return fetchUpriver<BrandResearchResponse>("/v2/brand/research", {
    method: "POST",
    body: JSON.stringify({
      response_format: "json",
      effort: "auto",
      ...options,
    }),
  }, apiKey);
}

export async function getProducts(
  options: ProductsOptions,
  apiKey?: string
): Promise<ProductsResponse> {
  return fetchUpriver<ProductsResponse>("/v1/brand/products", {
    method: "POST",
    body: JSON.stringify({
      response_format: "json",
      effort: "auto",
      ...options,
    }),
  }, apiKey);
}

export async function getAudienceInsights(
  options: AudienceInsightsOptions,
  apiKey?: string
): Promise<AudienceInsightsResponse> {
  return fetchUpriver<AudienceInsightsResponse>("/v2/audience_insights", {
    method: "POST",
    body: JSON.stringify({
      citations_mode: "async",
      ...options,
    }),
  }, apiKey);
}

export async function getInsightCitations(
  options: InsightCitationsOptions,
  apiKey?: string
): Promise<InsightCitationsResponse> {
  return fetchUpriver<InsightCitationsResponse>(
    `/v2/audience_insights/${options.continuation_token}/citations`,
    {
      method: "GET",
    },
    apiKey
  );
}

export async function getProductDetails(
  options: ProductDetailsOptions,
  apiKey?: string
): Promise<ProductDetailsResponse> {
  return fetchUpriver<ProductDetailsResponse>("/v1/brand/product", {
    method: "POST",
    body: JSON.stringify({
      effort: "low",
      ...options,
    }),
  }, apiKey);
}
