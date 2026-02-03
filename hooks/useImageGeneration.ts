"use client";

import { useState, useEffect, useCallback } from "react";
import { CodeBlockStatus } from "@/components/code-block-card";
import {
  getBrandDetails,
  getProducts,
  getProductDetails,
  getAudienceInsights,
  getInsightCitations,
} from "@/services/upriver";
import { generateImage } from "@/services/nano-banana";
import { generateImagePrompt, selectProduct } from "@/services/gemini";
import {
  buildAudienceInsightsPayload,
  extractContinuationToken,
} from "@/lib/workflow-helpers";
import { getStoredApiKeys } from "@/lib/api-keys";
import type { PromptFormValues } from "@/components/prompt-form";
import type {
  BrandResearchResponse,
  ProductsResponse,
  ProductDetailsResponse,
  AudienceInsightsResponse,
  InsightCitationsResponse,
  ProductInfo,
} from "@/services/upriver-types";

// Filter out non-visual or unsuitable products for image generation
// Only excludes gift cards, vouchers, and memberships - keeps digital products/software
function shouldExcludeProduct(product: ProductInfo): boolean {
  const excludePatterns = [
    // Gift cards and vouchers
    /gift\s*card/i,
    /e-?gift/i,
    /voucher/i,
    /gift\s*certificate/i,

    // Memberships and subscriptions (non-product)
    /membership/i,
    /subscription(?!\s*box)/i, // Exclude "subscription" but allow "subscription box"
  ];

  const textToCheck = `${product.name} ${product.category}`.toLowerCase();

  return excludePatterns.some(pattern => pattern.test(textToCheck));
}

export function useImageGeneration() {
  const [brandUrl, setBrandUrl] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brandResearch, setBrandResearch] =
    useState<BrandResearchResponse | null>(null);
  const [products, setProducts] = useState<ProductsResponse | null>(null);
  const [productDetails, setProductDetails] =
    useState<ProductDetailsResponse | null>(null);
  const [audienceInsights, setAudienceInsights] =
    useState<AudienceInsightsResponse | null>(null);
  const [audienceInsightsCitations, setAudienceInsightsCitations] =
    useState<InsightCitationsResponse | null>(null);

  const [brandResearchStatus, setBrandResearchStatus] =
    useState<CodeBlockStatus>(CodeBlockStatus.NOT_STARTED);
  const [productsStatus, setProductsStatus] = useState<CodeBlockStatus>(
    CodeBlockStatus.NOT_STARTED
  );
  const [productDetailsStatus, setProductDetailsStatus] =
    useState<CodeBlockStatus>(CodeBlockStatus.NOT_STARTED);
  const [audienceInsightsStatus, setAudienceInsightsStatus] =
    useState<CodeBlockStatus>(CodeBlockStatus.NOT_STARTED);
  const [audienceInsightsCitationsStatus, setAudienceInsightsCitationsStatus] =
    useState<CodeBlockStatus>(CodeBlockStatus.NOT_STARTED);

  const [brandProductDetailsComplete, setBrandProductDetailsComplete] =
    useState(false);
  const [audienceInsightsComplete, setAudienceInsightsComplete] =
    useState(false);
  const [promptBuilt, setPromptBuilt] = useState(false);
  const [imageGenerating, setImageGenerating] = useState(false);

  useEffect(() => {
    if (!brandUrl.trim()) {
      return;
    }

    const brandResearchDone =
      brandResearchStatus === CodeBlockStatus.SUCCESS ||
      brandResearchStatus === CodeBlockStatus.ERROR;
    const productsDone =
      productsStatus === CodeBlockStatus.SUCCESS ||
      productsStatus === CodeBlockStatus.ERROR;
    const productDetailsDone =
      productDetailsStatus === CodeBlockStatus.SUCCESS ||
      productDetailsStatus === CodeBlockStatus.ERROR ||
      productDetailsStatus === CodeBlockStatus.NOT_STARTED;

    if (brandResearchDone && productsDone && productDetailsDone) {
      setBrandProductDetailsComplete(true);
    }

    const audienceInsightsDone =
      audienceInsightsStatus === CodeBlockStatus.SUCCESS ||
      audienceInsightsStatus === CodeBlockStatus.ERROR;
    const citationsDone =
      audienceInsightsCitationsStatus === CodeBlockStatus.SUCCESS ||
      audienceInsightsCitationsStatus === CodeBlockStatus.ERROR ||
      audienceInsightsCitationsStatus === CodeBlockStatus.NOT_STARTED;

    if (audienceInsightsDone && citationsDone) {
      setAudienceInsightsComplete(true);
    }
  }, [
    brandUrl,
    brandResearchStatus,
    productsStatus,
    productDetailsStatus,
    audienceInsightsStatus,
    audienceInsightsCitationsStatus,
  ]);

  const handleGenerateImage = useCallback(
    async (formValues: PromptFormValues) => {
      const brandUrlValue = formValues.brandUrl.trim();
      const briefValue = formValues.brief || "";

      setBrandUrl(brandUrlValue);
      setIsLoading(true);
      setError(null);
      setImageDataUrl(null);
      setBrandResearch(null);
      setProducts(null);
      setProductDetails(null);
      setAudienceInsights(null);
      setAudienceInsightsCitations(null);
      setBrandResearchStatus(CodeBlockStatus.NOT_STARTED);
      setProductsStatus(CodeBlockStatus.NOT_STARTED);
      setProductDetailsStatus(CodeBlockStatus.NOT_STARTED);
      setAudienceInsightsStatus(CodeBlockStatus.NOT_STARTED);
      setAudienceInsightsCitationsStatus(CodeBlockStatus.NOT_STARTED);
      setBrandProductDetailsComplete(false);
      setAudienceInsightsComplete(false);
      setPromptBuilt(false);
      setImageGenerating(false);

      try {
        const { upriverApiKey, geminiApiKey } = getStoredApiKeys();

        let brandResearchData: BrandResearchResponse | null = null;
        let productsData: ProductsResponse | null = null;
        let productDetailsData: ProductDetailsResponse | null = null;
        let audienceInsightsData: AudienceInsightsResponse | null = null;
        let audienceInsightsCitationsData: InsightCitationsResponse | null =
          null;

        if (brandUrlValue) {
          setBrandResearchStatus(CodeBlockStatus.LOADING);
          setProductsStatus(CodeBlockStatus.LOADING);

          const [brandResearchRes, productsRes] = await Promise.allSettled([
            getBrandDetails({ brand_url: brandUrlValue }, upriverApiKey),
            getProducts({ brand_url: brandUrlValue }, upriverApiKey),
          ]);

          brandResearchData =
            brandResearchRes.status === "fulfilled"
              ? brandResearchRes.value
              : null;
          if (brandResearchData) {
            setBrandResearchStatus(CodeBlockStatus.SUCCESS);
            setBrandResearch(brandResearchData);
          } else {
            console.warn(
              "Brand research unavailable:",
              brandResearchRes.status === "rejected" &&
                brandResearchRes.reason instanceof Error
                ? brandResearchRes.reason.message
                : "Unknown error"
            );
            setBrandResearchStatus(CodeBlockStatus.ERROR);
          }

          productsData =
            productsRes.status === "fulfilled" ? productsRes.value : null;
          if (productsData) {
            setProductsStatus(CodeBlockStatus.SUCCESS);
            setProducts(productsData);

            // Fetch product details for AI-selected product (excluding gift cards, etc.)
            if (productsData.products && productsData.products.length > 0) {
              // Step 1: Filter out unsuitable products
              const filteredProducts = productsData.products.filter(
                (product) => !shouldExcludeProduct(product)
              );

              let selectedProduct: ProductInfo | null = null;

              if (filteredProducts.length > 0) {
                // Step 2: Use AI to select from filtered products
                try {
                  const selectionResult = await selectProduct(
                    {
                      products: filteredProducts,
                      brandResearch: brandResearchData,
                      brief: briefValue,
                    },
                    geminiApiKey
                  );
                  selectedProduct = selectionResult.selectedProduct;
                  console.log(
                    "AI selected product:",
                    selectionResult.reasoning || selectedProduct.name
                  );
                } catch (err) {
                  console.warn(
                    "AI product selection failed, using random fallback:",
                    err
                  );
                  // Fallback: Random selection from filtered products
                  const randomIndex = Math.floor(
                    Math.random() * filteredProducts.length
                  );
                  selectedProduct = filteredProducts[randomIndex];
                  console.log(
                    "Randomly selected product:",
                    selectedProduct.name
                  );
                }
              }

              if (selectedProduct) {
                setProductDetailsStatus(CodeBlockStatus.LOADING);

                try {
                  productDetailsData = await getProductDetails(
                    {
                      brand_name: brandResearchData?.brand.name || "",
                      product_name: selectedProduct.name,
                      product_url: selectedProduct.url,
                    },
                    upriverApiKey
                  );
                  setProductDetailsStatus(CodeBlockStatus.SUCCESS);
                  setProductDetails(productDetailsData);
                } catch (err) {
                  console.warn(
                    "Product details unavailable:",
                    err instanceof Error ? err.message : "Unknown error"
                  );
                  setProductDetailsStatus(CodeBlockStatus.ERROR);
                }
              } else {
                console.warn(
                  "No suitable products found for image generation (all products filtered out)"
                );
              }
            }
          } else {
            console.warn(
              "Products unavailable:",
              productsRes.status === "rejected" &&
                productsRes.reason instanceof Error
                ? productsRes.reason.message
                : "Unknown error"
            );
            setProductsStatus(CodeBlockStatus.ERROR);
          }

          const audienceInsightsPayload = buildAudienceInsightsPayload(
            brandResearchData,
            productsData,
            briefValue
          );

          setAudienceInsightsStatus(CodeBlockStatus.LOADING);

          try {
            audienceInsightsData = await getAudienceInsights(
              audienceInsightsPayload,
              upriverApiKey
            );
            setAudienceInsightsStatus(CodeBlockStatus.SUCCESS);
            setAudienceInsights(audienceInsightsData);
          } catch (err) {
            console.warn(
              "Audience insights unavailable:",
              err instanceof Error ? err.message : "Unknown error"
            );
            setAudienceInsightsStatus(CodeBlockStatus.ERROR);
          }

          const continuationToken =
            extractContinuationToken(audienceInsightsData);

          if (continuationToken) {
            setAudienceInsightsCitationsStatus(CodeBlockStatus.LOADING);

            try {
              audienceInsightsCitationsData = await getInsightCitations({
                continuation_token: continuationToken,
              }, upriverApiKey);
              setAudienceInsightsCitationsStatus(CodeBlockStatus.SUCCESS);
              setAudienceInsightsCitations(audienceInsightsCitationsData);
            } catch (err) {
              console.warn(
                "Audience insights citations unavailable:",
                err instanceof Error ? err.message : "Unknown error"
              );
              setAudienceInsightsCitationsStatus(CodeBlockStatus.ERROR);
            }
          }
        } else {
          setBrandProductDetailsComplete(true);
          setAudienceInsightsComplete(true);
        }

        const promptResult = await generateImagePrompt({
          brandUrl: brandUrlValue || "",
          additionalInstructions: briefValue.trim() || undefined,
          brandResearch: brandResearchData,
          products: productsData,
          productDetails: productDetailsData,
          audienceInsights: audienceInsightsData,
          audienceInsightsCitations: audienceInsightsCitationsData,
        }, geminiApiKey);
        setPromptBuilt(true);

        setImageGenerating(true);

        // Extract reference images from product details
        const referenceImageUrls: string[] = [];
        if (productDetailsData && productDetailsData.images && productDetailsData.images.length > 0) {
          // Use the first image as reference
          referenceImageUrls.push(productDetailsData.images[0]);
        }

        const imageResult = await generateImage({
          prompt: promptResult.prompt,
          referenceImageUrls: referenceImageUrls.length > 0 ? referenceImageUrls : undefined,
        }, geminiApiKey);
        setImageDataUrl(imageResult.dataUrl);
        setImageGenerating(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    brandUrl,
    imageDataUrl,
    isLoading,
    error,
    brandResearch,
    products,
    productDetails,
    audienceInsights,
    audienceInsightsCitations,
    brandResearchStatus,
    productsStatus,
    productDetailsStatus,
    audienceInsightsStatus,
    audienceInsightsCitationsStatus,
    brandProductDetailsComplete,
    audienceInsightsComplete,
    promptBuilt,
    imageGenerating,
    generateImage: handleGenerateImage,
  };
}
