"use client";

import { useState } from "react";
import {
  ResizablePanel,
  ResizableHandle,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SparklesIcon, ExternalLinkIcon } from "lucide-react";
import { CodeBlockCard } from "@/components/code-block-card";
import {
  getBrandDetails,
  getProducts,
  getAudienceInsights,
  getInsightCitations,
} from "@/services/upriver-client";
import { generateImage } from "@/services/nano-banana-client";
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

    try {
      const imagePromise = generateImage({ prompt: brief });

      let brandResearchData: unknown = null;
      let productsData: unknown = null;
      let audienceInsightsData: unknown = null;
      let audienceInsightsCitationsData: unknown = null;

      if (brandUrl.trim()) {
        const brandUrlValue = brandUrl.trim();

        const [brandResearchRes, productsRes] = await Promise.all([
          getBrandDetails({ brand_url: brandUrlValue }).catch((err) => {
            console.error("Brand research error:", err);
            return { error: err.message };
          }),
          getProducts({ brand_url: brandUrlValue }).catch((err) => {
            console.error("Products error:", err);
            return { error: err.message };
          }),
        ]);

        brandResearchData = brandResearchRes;
        productsData = productsRes;

        const audienceInsightsPayload = buildAudienceInsightsPayload(
          brandResearchRes,
          brandUrlValue,
          brief
        );

        audienceInsightsData = await getAudienceInsights(
          audienceInsightsPayload
        ).catch((err) => {
          console.error("Audience insights error:", err);
          return { error: err.message };
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

          audienceInsightsCitationsData = await getInsightCitations({
            continuation_token: continuationToken,
          })
            .then((data) => {
              console.log("Citations data received:", data);
              return data;
            })
            .catch((err) => {
              console.error("Audience insights citations error:", err);
              return { error: err.message };
            });
        } else {
          console.log(
            "No continuation_token found in audience insights:",
            audienceInsightsData
          );
        }
      }

      const imageResult = await imagePromise;
      setImageDataUrl(imageResult.dataUrl);

      if (brandUrl.trim()) {
        setBrandResearch(brandResearchData);
        setProducts(productsData);
        setAudienceInsights(audienceInsightsData);
        setAudienceInsightsCitations(audienceInsightsCitationsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-between bg-white dark:bg-black sm:items-start">
      <ResizablePanelGroup
        direction="horizontal"
        className="flex grow"
      >
        <ResizablePanel
          defaultSize={60}
          minSize={800}
          className="flex flex-col"
        >
          <section className="flex flex-col gap-3 w-full p-5">
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
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </section>
          <Separator />
          <section className="flex flex-col grow gap-3 w-full p-5">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-400">
                  Generating image...
                </p>
              </div>
            ) : imageDataUrl ? (
              <div className="flex items-start justify-center h-full">
                <img
                  src={imageDataUrl}
                  alt="Generated image"
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                Enter a brand URL and click Generate Image to create an image
              </div>
            )}
          </section>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          defaultSize={40}
          minSize={400}
          className="p-5"
        >
          <ul className="flex flex-col gap-3 list-none p-0 m-0">
            {getApiEndpoints(BASE_DOCS_URL, {
              brandResearch,
              products,
              audienceInsights,
              audienceInsightsCitations,
            }).map((endpoint, index) => (
              <li key={index}>
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
                />
              </li>
            ))}
          </ul>
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}
