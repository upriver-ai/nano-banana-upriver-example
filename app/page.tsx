"use client";

import {
  ResizablePanel,
  ResizableHandle,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLinkIcon } from "lucide-react";
import { CodeBlockCard, CodeBlockStatus } from "@/components/code-block-card";
import { LoaderState } from "@/components/loader-state";
import { PromptForm } from "@/components/prompt-form";
import { SettingsMenu } from "@/components/settings-menu";
import { getApiEndpoints } from "@/lib/api-endpoints";
import { formatJsonForDisplay } from "@/lib/utils";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import Image from "next/image";
import Link from "next/link";

const UPRIVER_URL = "https://upriver.ai";
const UPRIVER_DOCS_URL = "https://docs.upriver.ai/";

export default function Home() {
  const {
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
    generateImage,
  } = useImageGeneration();

  return (
    <main className="flex h-screen w-full flex-col items-center justify-between bg-white dark:bg-black sm:items-start overflow-hidden">
      <ResizablePanelGroup
        direction="horizontal"
        className="flex grow h-full"
      >
        <ResizablePanel
          defaultSize={40}
          minSize="30%"
          className="flex flex-col h-full"
        >
          <ScrollArea className="h-full w-full">
            <div className="flex flex-col min-w-0">
              <section className="flex flex-col gap-5 w-full p-5 min-w-0">
                {/* header */}
                <div className="flex flex-row items-center justify-between gap-2 w-full">
                  <div className="flex flex-row items-center gap-2">
                    <Link
                      href={`${UPRIVER_URL}?ref=banana`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Image
                        src="/icon.svg"
                        alt="Upriver"
                        width={28}
                        height={28}
                      />
                    </Link>
                    <h1 className="text-2xl font-bold">
                      Upriver x Nano Banana Example
                    </h1>
                  </div>
                  <SettingsMenu />
                </div>
                {/* prompt builder form */}
                <PromptForm
                  onSubmit={generateImage}
                  isLoading={isLoading}
                  error={error}
                />
              </section>
              <Separator />
              {/* code block cards */}
              <ul className="flex flex-col gap-5 list-none p-5 min-w-0">
                <div className="flex flex-col gap-2">
                  <h2 className="text-lg font-bold">Upriver API</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    The following Upriver API endpoints are used to power the
                    image generation:
                  </p>
                </div>
                {getApiEndpoints(UPRIVER_DOCS_URL, {
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
          minSize="40%"
          className="p-5 bg-black"
        >
          {/* image output section */}
          {isLoading ? (
            <LoaderState
              brandProductDetailsComplete={brandProductDetailsComplete}
              audienceInsightsComplete={audienceInsightsComplete}
              promptBuilt={promptBuilt}
              imageGenerating={imageGenerating}
              imageDataUrl={imageDataUrl}
            />
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
