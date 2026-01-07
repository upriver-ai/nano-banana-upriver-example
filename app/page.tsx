"use client";

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
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-between bg-white dark:bg-black sm:items-start">
      <section className="flex flex-col gap-3 p-5 w-full">
        <Label htmlFor="brand">Brand</Label>
        <div className="grow flex flex-row gap-3 w-full">
          <Input
            id="brand"
            type="url"
            placeholder="acme.com"
            className="flex grow"
          />
          <Button>
            <SparklesIcon className="size-4" />
            Generate Image
          </Button>
        </div>
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
          This is the left panel
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
