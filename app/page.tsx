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
import { getApiEndpoints } from "@/lib/api-endpoints";
import { formatJsonForDisplay } from "@/lib/utils";
import { useImageGeneration } from "@/hooks/useImageGeneration";

const BASE_DOCS_URL = "https://docs.upriver.ai/";

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
          minSize={400}
          className="flex flex-col h-full"
        >
          <ScrollArea className="h-full w-full">
            <div className="flex flex-col min-w-0">
              {/* prompt builder form */}
              <section className="w-full p-5 min-w-0">
                <PromptForm
                  onSubmit={generateImage}
                  isLoading={isLoading}
                  error={error}
                />
              </section>
              <Separator />
              {/* code block cards */}
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
