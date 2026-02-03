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
    productDetails: unknown;
    audienceInsights: unknown;
    audienceInsightsCitations: unknown;
  }
): ApiEndpoint[] {
  return [
    {
      title: "/brand/research",
      url: `${baseDocsUrl}/api-reference/brands/brand-details?ref=banana`,
      description:
        "Get brand information including industry, values, and mission",
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
      url: `${baseDocsUrl}/api-reference/products/products?ref=banana`,
      description: "Get products associated with a brand",
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
      title: "/brand/product",
      url: `${baseDocsUrl}/api-reference/products/product-details?ref=banana`,
      description: "Get detailed information about a specific product",
      curlRequest: `const options = {
  method: 'POST',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    brand_name: 'ACME',
    product_name: 'Widget Pro',
    product_url: 'https://acme.com/products/widget-pro',
    effort: 'low'
  })
};

fetch('https://api.upriver.ai/v1/brand/product', options)
  .then(res => res.json())
  .then(res => {
    // Handle response
  })
  .catch(err => console.error(err));`,
      data: data.productDetails,
    },
    {
      title: "/audience_insights",
      url: `${baseDocsUrl}/api-reference/audience/insights?ref=banana`,
      description:
        "Get relevant audience insights for a specified brand and/or product",
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
      url: `${baseDocsUrl}/api-reference/audience/insights-citations?ref=banana`,
      description: "Get real-world evidence for audience insights",
      curlRequest: `curl -X GET "https://api.upriver.ai/v2/audience_insights/{continuation_token}/citations" \\
  -H "X-API-Key: YOUR_API_KEY"`,
      data: data.audienceInsightsCitations,
    },
  ];
}
