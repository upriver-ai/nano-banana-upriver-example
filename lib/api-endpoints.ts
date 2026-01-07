export interface ApiEndpoint {
  title: string;
  url: string;
  description: string;
  curlRequest: string;
  data: unknown;
}

export function getApiEndpoints(
  baseDocsUrl: string,
  data: {
    brandResearch: unknown;
    products: unknown;
    audienceInsights: unknown;
    audienceInsightsCitations: unknown;
  }
): ApiEndpoint[] {
  return [
    {
      title: "/brand/research",
      url: `${baseDocsUrl}/api-reference/brands/brand-details`,
      description: "Get the details of a brand",
      curlRequest: `curl -X POST "https://api.upriver.ai/v2/brand/research" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "brand_url": "https://acme.com",
    "response_format": "json",
    "effort": "auto"
  }'`,
      data: data.brandResearch,
    },
    {
      title: "/brand/products",
      url: `${baseDocsUrl}/api-reference/products/products`,
      description: "Get the products of a brand",
      curlRequest: `curl -X POST "https://api.upriver.ai/v1/brand/products" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "brand_url": "https://acme.com",
    "response_format": "json",
    "effort": "auto"
  }'`,
      data: data.products,
    },
    {
      title: "/audience_insights",
      url: `${baseDocsUrl}/api-reference/audience/insights`,
      description: "Get the audience insights of a brand",
      curlRequest: `curl -X POST "https://api.upriver.ai/v2/audience_insights" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "brief": "a social media ad",
    "citations_mode": "async"
  }'`,
      data: data.audienceInsights,
    },
    {
      title: "/audience_insights/{continuation_token}/citations",
      url: `${baseDocsUrl}/api-reference/audience/insights-citations`,
      description: "Get citations for audience insights",
      curlRequest: `curl -X GET "https://api.upriver.ai/v2/audience_insights/{continuation_token}/citations" \\
  -H "X-API-Key: YOUR_API_KEY"`,
      data: data.audienceInsightsCitations,
    },
  ];
}

