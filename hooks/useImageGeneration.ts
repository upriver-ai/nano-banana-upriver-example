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

export function useImageGeneration() {
  const [brandUrl, setBrandUrl] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brandResearch, setBrandResearch] = useState<unknown>(null);
  const [products, setProducts] = useState<unknown>(null);
  const [audienceInsights, setAudienceInsights] = useState<unknown>(null);
  const [audienceInsightsCitations, setAudienceInsightsCitations] =
    useState<unknown>(null);

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
        let brandResearchData: unknown = null;
        let productsData: unknown = null;
        let audienceInsightsData: unknown = null;
        let audienceInsightsCitationsData: unknown = null;

        if (brandUrlValue) {
          setBrandResearchStatus(CodeBlockStatus.LOADING);
          setProductsStatus(CodeBlockStatus.LOADING);

          const [brandResearchRes, productsRes] = await Promise.all([
            getBrandDetails({ brand_url: brandUrlValue })
              .then((data) => {
                setBrandResearchStatus(CodeBlockStatus.SUCCESS);
                setBrandResearch(data);
                return data;
              })
              .catch((err) => {
                console.warn(
                  "Brand research unavailable:",
                  err instanceof Error ? err.message : "Unknown error"
                );
                setBrandResearchStatus(CodeBlockStatus.ERROR);
                const errorData = {
                  error:
                    err instanceof Error
                      ? err.message
                      : "Failed to fetch brand research",
                };
                setBrandResearch(errorData);
                return errorData;
              }),
            getProducts({ brand_url: brandUrlValue })
              .then((data) => {
                setProductsStatus(CodeBlockStatus.SUCCESS);
                setProducts(data);
                return data;
              })
              .catch((err) => {
                console.warn(
                  "Products unavailable:",
                  err instanceof Error ? err.message : "Unknown error"
                );
                setProductsStatus(CodeBlockStatus.ERROR);
                const errorData = {
                  error:
                    err instanceof Error
                      ? err.message
                      : "Failed to fetch products",
                };
                setProducts(errorData);
                return errorData;
              }),
          ]);

          brandResearchData = brandResearchRes;
          productsData = productsRes;

          const audienceInsightsPayload = buildAudienceInsightsPayload(
            brandResearchRes,
            productsRes,
            briefValue
          );

          setAudienceInsightsStatus(CodeBlockStatus.LOADING);

          audienceInsightsData = await getAudienceInsights(
            audienceInsightsPayload
          )
            .then((data) => {
              setAudienceInsightsStatus(CodeBlockStatus.SUCCESS);
              setAudienceInsights(data);
              return data;
            })
            .catch((err) => {
              console.warn(
                "Audience insights unavailable:",
                err instanceof Error ? err.message : "Unknown error"
              );
              setAudienceInsightsStatus(CodeBlockStatus.ERROR);
              const errorData = {
                error:
                  err instanceof Error
                    ? err.message
                    : "Failed to fetch audience insights",
              };
              setAudienceInsights(errorData);
              return errorData;
            });

          const continuationToken = extractContinuationToken(
            audienceInsightsData
          );

          if (continuationToken) {
            console.log(
              "Fetching citations with continuation_token:",
              continuationToken
            );

            setAudienceInsightsCitationsStatus(CodeBlockStatus.LOADING);

            audienceInsightsCitationsData = await getInsightCitations({
              continuation_token: continuationToken,
            })
              .then((data) => {
                console.log("Citations data received:", data);
                setAudienceInsightsCitationsStatus(CodeBlockStatus.SUCCESS);
                setAudienceInsightsCitations(data);
                return data;
              })
              .catch((err) => {
                console.warn(
                  "Audience insights citations unavailable:",
                  err instanceof Error ? err.message : "Unknown error"
                );
                setAudienceInsightsCitationsStatus(CodeBlockStatus.ERROR);
                const errorData = {
                  error:
                    err instanceof Error
                      ? err.message
                      : "Failed to fetch citations",
                };
                setAudienceInsightsCitations(errorData);
                return errorData;
              });
          } else if (
            audienceInsightsData &&
            typeof audienceInsightsData === "object" &&
            "error" in audienceInsightsData
          ) {
            console.warn("Audience insights failed, skipping citations");
          }
        } else {
          setBrandProductDetailsComplete(true);
          setAudienceInsightsComplete(true);
        }

        const promptResult = await generateImagePrompt({
          brandUrl: brandUrlValue || "",
          additionalInstructions: briefValue.trim() || undefined,
          brandResearch: brandResearchData as any,
          products: productsData as any,
          audienceInsights: audienceInsightsData as any,
          audienceInsightsCitations: audienceInsightsCitationsData as any,
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

