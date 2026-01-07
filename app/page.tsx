"use client";

import { useState, useEffect } from "react";
import {
  ResizablePanel,
  ResizableHandle,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SparklesIcon,
  ExternalLinkIcon,
  CircleCheck,
  Circle,
  LoaderCircle,
} from "lucide-react";
import { CodeBlockCard, CodeBlockStatus } from "@/components/code-block-card";
import {
  getBrandDetails,
  getProducts,
  getAudienceInsights,
  getInsightCitations,
} from "@/services/upriver-client";
import { generateImage } from "@/services/nano-banana-client";
import { generateImagePrompt } from "@/services/gemini-client";
import { getApiEndpoints } from "@/lib/api-endpoints";

const BASE_DOCS_URL = "https://docs.upriver.ai/";

export default function Home() {
  const [brief, setBrief] = useState("");
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

  const formatJsonForDisplay = (data: unknown): string => {
    return JSON.stringify(data, null, 2);
  };

  const buildAudienceInsightsPayload = (
    brandResearch: unknown,
    brandUrl: string,
    briefValue: string
  ) => {
    const defaultBrief = "a campaign that raises brand awareness";
    const briefToUse = briefValue.trim() || defaultBrief;

    if (
      !brandResearch ||
      typeof brandResearch !== "object" ||
      "error" in brandResearch ||
      !("brand" in brandResearch)
    ) {
      return { brief: briefToUse };
    }

    const research = brandResearch as {
      brand?: { voice?: string; values?: string[]; industry?: string };
      industries?: string[];
      audience?: { description?: string };
    };

    const payload: {
      brief: string;
      industries?: string[];
      brand?: { voice?: string; values?: string[] };
      audience?: { description?: string };
    } = {
      brief: briefToUse,
    };

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

    return payload;
  };

  const handleGenerateImage = async () => {
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

      if (brandUrl.trim()) {
        const brandUrlValue = brandUrl.trim();

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
          brandUrlValue,
          brief
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

        const continuationToken =
          audienceInsightsData &&
          typeof audienceInsightsData === "object" &&
          "meta" in audienceInsightsData &&
          audienceInsightsData.meta &&
          typeof audienceInsightsData.meta === "object" &&
          "continuation_token" in audienceInsightsData.meta &&
          audienceInsightsData.meta.continuation_token
            ? (audienceInsightsData.meta.continuation_token as string)
            : audienceInsightsData &&
              typeof audienceInsightsData === "object" &&
              "continuation_token" in audienceInsightsData &&
              audienceInsightsData.continuation_token
            ? (audienceInsightsData.continuation_token as string)
            : null;

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
        brandUrl: brandUrl.trim() || "",
        additionalInstructions: brief.trim() || undefined,
        brandResearch: brandResearchData as any,
        products: productsData as any,
        audienceInsights: audienceInsightsData as any,
        audienceInsightsCitations: audienceInsightsCitationsData as any,
      });

      console.log("Generated prompt result:", promptResult);
      console.log("Generated prompt:", promptResult.prompt);
      setPromptBuilt(true);

      setImageGenerating(true);
      const imageResult = await generateImage({ prompt: promptResult.prompt });
      setImageDataUrl(imageResult.dataUrl);
      setImageGenerating(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex h-screen w-full flex-col items-center justify-between bg-white dark:bg-black sm:items-start overflow-hidden">
      <ResizablePanelGroup
        direction="horizontal"
        className="flex grow h-full"
      >
        <ResizablePanel
          defaultSize={40}
          minSize={400}
          className="flex flex-col h-full"
        >
          <ScrollArea className="h-full w-full">
            <div className="flex flex-col min-w-0">
              <section className="flex flex-col gap-3 w-full p-5 min-w-0">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="brandUrl">Brand URL</Label>
                    <Input
                      id="brandUrl"
                      type="text"
                      placeholder="https://acme.com"
                      value={brandUrl}
                      onChange={(e) => setBrandUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !isLoading) {
                          handleGenerateImage();
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="brief">
                      Additional Instructions (optional)
                    </Label>
                    <Input
                      id="brief"
                      type="text"
                      placeholder="Generate an image that's on-brand and aligned with their audience"
                      value={brief}
                      onChange={(e) => setBrief(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !isLoading) {
                          handleGenerateImage();
                        }
                      }}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleGenerateImage}
                  disabled={isLoading}
                  className="self-start"
                >
                  <SparklesIcon className="size-4" />
                  {isLoading ? "Generating..." : "Generate Image"}
                </Button>
                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}
              </section>
              <Separator />
              <ul className="flex flex-col gap-3 list-none p-5 min-w-0">
                {getApiEndpoints(BASE_DOCS_URL, {
                  brandResearch,
                  products,
                  audienceInsights,
                  audienceInsightsCitations,
                }).map((endpoint, index) => {
                  let status: CodeBlockStatus;
                  if (index === 0) {
                    status = brandResearchStatus;
                  } else if (index === 1) {
                    status = productsStatus;
                  } else if (index === 2) {
                    status = audienceInsightsStatus;
                  } else {
                    status = audienceInsightsCitationsStatus;
                  }

                  return (
                    <li
                      key={index}
                      className="min-w-0"
                    >
                      <CodeBlockCard
                        title={endpoint.title}
                        actionLink={endpoint.url}
                        actionIcon={ExternalLinkIcon}
                        description={endpoint.description}
                        code={
                          endpoint.data !== null && endpoint.data !== undefined
                            ? formatJsonForDisplay(endpoint.data)
                            : endpoint.curlRequest
                        }
                        status={status}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          </ScrollArea>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          defaultSize={60}
          minSize={600}
          className="p-5 bg-black"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col gap-4">
                <div
                  className={`flex items-center gap-3 ${
                    !brandProductDetailsComplete ? "animate-pulse" : ""
                  }`}
                >
                  {brandProductDetailsComplete ? (
                    <CircleCheck className="size-5 text-green-500" />
                  ) : (
                    <LoaderCircle className="size-5 text-gray-400 animate-spin" />
                  )}
                  <span className="text-gray-300">
                    Fetching brand & product details
                  </span>
                </div>
                <div
                  className={`flex items-center gap-3 ${
                    brandProductDetailsComplete && !audienceInsightsComplete
                      ? "animate-pulse"
                      : ""
                  }`}
                >
                  {audienceInsightsComplete ? (
                    <CircleCheck className="size-5 text-green-500" />
                  ) : brandProductDetailsComplete ? (
                    <LoaderCircle className="size-5 text-gray-400 animate-spin" />
                  ) : (
                    <Circle className="size-5 text-gray-600" />
                  )}
                  <span className="text-gray-300">
                    Gathering audience insights
                  </span>
                </div>
                <div
                  className={`flex items-center gap-3 ${
                    audienceInsightsComplete && !promptBuilt
                      ? "animate-pulse"
                      : ""
                  }`}
                >
                  {promptBuilt ? (
                    <CircleCheck className="size-5 text-green-500" />
                  ) : audienceInsightsComplete ? (
                    <LoaderCircle className="size-5 text-gray-400 animate-spin" />
                  ) : (
                    <Circle className="size-5 text-gray-600" />
                  )}
                  <span className="text-gray-300">Building prompt</span>
                </div>
                <div
                  className={`flex items-center gap-3 ${
                    promptBuilt && imageGenerating ? "animate-pulse" : ""
                  }`}
                >
                  {!promptBuilt ? (
                    <Circle className="size-5 text-gray-600" />
                  ) : imageGenerating ? (
                    <LoaderCircle className="size-5 text-gray-400 animate-spin" />
                  ) : imageDataUrl ? (
                    <CircleCheck className="size-5 text-green-500" />
                  ) : (
                    <Circle className="size-5 text-gray-600" />
                  )}
                  <span className="text-gray-300">Generating image</span>
                </div>
              </div>
            </div>
          ) : imageDataUrl ? (
            <div className="flex items-center justify-center h-full">
              <img
                src={imageDataUrl}
                alt="Generated image"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              Enter a brand URL and click "Generate Image" to create an image
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}
