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

const BASE_DOCS_URL = "https://docs.upriver.ai/";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setIsLoading(true);
    setError(null);
    setImageDataUrl(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate image");
      }

      const data = await response.json();
      setImageDataUrl(data.dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-between bg-white dark:bg-black sm:items-start">
      <section className="flex flex-col gap-3 p-5 w-full">
        <Label htmlFor="prompt">Image Prompt</Label>
        <div className="grow flex flex-row gap-3 w-full">
          <Input
            id="prompt"
            type="text"
            placeholder="Create a picture of a futuristic banana with neon lights in a cyberpunk city."
            className="flex grow"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isLoading) {
                handleGenerateImage();
              }
            }}
          />
          <Button
            onClick={handleGenerateImage}
            disabled={isLoading}
          >
            <SparklesIcon className="size-4" />
            {isLoading ? "Generating..." : "Generate Image"}
          </Button>
        </div>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </section>
      <Separator />
      <ResizablePanelGroup
        direction="horizontal"
        className="flex grow"
      >
        <ResizablePanel
          defaultSize={75}
          className="p-5"
          minSize={800}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 dark:text-gray-400">
                Generating image...
              </p>
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
              Enter a prompt and click Generate Image to create an image
            </div>
          )}
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          defaultSize={25}
          minSize={400}
          className="p-5"
        >
          <ul className="flex flex-col gap-3 list-none p-0 m-0">
            <li>
              <CodeBlockCard
                title="/brand/research"
                actionLink={`${BASE_DOCS_URL}/api-reference/brands/brand-details`}
                actionIcon={ExternalLinkIcon}
                description="Get the details of a brand"
                code={`curl -X GET "https://api.upriver.ai/v2/brand/research" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "brand": "acme.com",
    "include_analytics": true,
    "include_products": true,
    "include_audience": true,
    "date_range": {
      "start": "2024-01-01",
      "end": "2024-12-31"
    }
  }'`}
              />
            </li>
            <li>
              <CodeBlockCard
                title="/brand/products"
                actionLink={`${BASE_DOCS_URL}/api-reference/products/products`}
                actionIcon={ExternalLinkIcon}
                description="Get the products of a brand"
                code={`curl -X GET "https://api.upriver.ai/v2/brand/products" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "brand": "acme.com",
    "limit": 50,
    "offset": 0,
    "sort_by": "popularity",
    "include_metadata": true
  }'`}
              />
            </li>
            <li>
              <CodeBlockCard
                title="/audience_insights"
                actionLink={`${BASE_DOCS_URL}/api-reference/audience/insights`}
                actionIcon={ExternalLinkIcon}
                description="Get the audience insights of a brand"
                code={`curl -X GET "https://api.upriver.ai/v2/audience_insights" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "brand": "acme.com",
    "demographics": true,
    "interests": true,
    "behaviors": true,
    "geographic": true
  }'`}
              />
            </li>
          </ul>
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}
