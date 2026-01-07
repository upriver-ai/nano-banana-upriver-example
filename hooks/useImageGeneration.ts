"use client";

import { useState, useEffect, useCallback } from "react";
import { CodeBlockStatus } from "@/components/code-block-card";
import {
  getBrandDetails,
  getProducts,
  getAudienceInsights,
  getInsightCitations,
} from "@/services/upriver";
import { generateImage } from "@/services/nano-banana";
import { generateImagePrompt } from "@/services/gemini";
import {
  buildAudienceInsightsPayload,
  extractContinuationToken,
} from "@/lib/workflow-helpers";
import type { PromptFormValues } from "@/components/prompt-form";
import type {
  BrandResearchResponse,
  ProductsResponse,
  AudienceInsightsResponse,
  InsightCitationsResponse,
} from "@/services/upriver-types";

export function useImageGeneration() {
  const [brandUrl, setBrandUrl] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brandResearch, setBrandResearch] =
    useState<BrandResearchResponse | null>(null);
  const [products, setProducts] = useState<ProductsResponse | null>(null);
  const [audienceInsights, setAudienceInsights] =
    useState<AudienceInsightsResponse | null>(null);
  const [audienceInsightsCitations, setAudienceInsightsCitations] =
    useState<InsightCitationsResponse | null>(null);

  const [brandResearchStatus, setBrandResearchStatus] =
    useState<CodeBlockStatus>(CodeBlockStatus.NOT_STARTED);
  const [productsStatus, setProductsStatus] = useState<CodeBlockStatus>(
    CodeBlockStatus.NOT_STARTED
  );
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

    if (brandResearchDone && productsDone) {
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
      setAudienceInsights(null);
      setAudienceInsightsCitations(null);
      setBrandResearchStatus(CodeBlockStatus.NOT_STARTED);
      setProductsStatus(CodeBlockStatus.NOT_STARTED);
      setAudienceInsightsStatus(CodeBlockStatus.NOT_STARTED);
      setAudienceInsightsCitationsStatus(CodeBlockStatus.NOT_STARTED);
      setBrandProductDetailsComplete(false);
      setAudienceInsightsComplete(false);
      setPromptBuilt(false);
      setImageGenerating(false);

      try {
        let brandResearchData: BrandResearchResponse | null = null;
        let productsData: ProductsResponse | null = null;
        let audienceInsightsData: AudienceInsightsResponse | null = null;
        let audienceInsightsCitationsData: InsightCitationsResponse | null =
          null;

        if (brandUrlValue) {
          setBrandResearchStatus(CodeBlockStatus.LOADING);
          setProductsStatus(CodeBlockStatus.LOADING);

          const [brandResearchRes, productsRes] = await Promise.allSettled([
            getBrandDetails({ brand_url: brandUrlValue }),
            getProducts({ brand_url: brandUrlValue }),
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
              audienceInsightsPayload
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
            console.log(
              "Fetching citations with continuation_token:",
              continuationToken
            );

            setAudienceInsightsCitationsStatus(CodeBlockStatus.LOADING);

            try {
              audienceInsightsCitationsData = await getInsightCitations({
                continuation_token: continuationToken,
              });
              console.log(
                "Citations data received:",
                audienceInsightsCitationsData
              );
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
          audienceInsights: audienceInsightsData,
          audienceInsightsCitations: audienceInsightsCitationsData,
        });
        setPromptBuilt(true);

        setImageGenerating(true);
        const imageResult = await generateImage({
          prompt: promptResult.prompt,
        });
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
    audienceInsights,
    audienceInsightsCitations,
    brandResearchStatus,
    productsStatus,
    audienceInsightsStatus,
    audienceInsightsCitationsStatus,
    brandProductDetailsComplete,
    audienceInsightsComplete,
    promptBuilt,
    imageGenerating,
    generateImage: handleGenerateImage,
  };
}
