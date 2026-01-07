# Upriver x Nano Banana Example

![Screenshot](public/screenshot.png)

A working example of an image generation workflow combining [Upriver](https://upriver.ai?ref=banana) and Nano Banana.

This example shows how to use Upriver to gather external social context about a brand and its audience. That context helps generate images that are more on-brand and relevant.

In this example, the following Upriver endpoints are used:

- [Brand Details](https://docs.upriver.ai/api-reference/brands/brand-details?ref=banana) - Brand information including industry, values, and mission
- [Brand Products](https://docs.upriver.ai/api-reference/products/products?ref=banana) - Products associated with a brand
- [Audience Insights](https://docs.upriver.ai/api-reference/audience/insights?ref=banana) - Relevant audience insights for a specified brand and/or product
- [Audience Insight Citations](https://docs.upriver.ai/api-reference/audience/insights-citations?ref=banana) - Real-world evidence for audience insights

## Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Copy `.env.example` to `.env.local` and add your API keys:**

```bash
cp .env.example .env.local
```

Edit `.env.local` and replace the placeholder values with your actual API keys:

- Get your **Gemini API Key** from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Get your **Upriver API Key** by emailing [support@upriver.ai](mailto:support@upriver.ai)

3. **Start the development server:**

```bash
npm run dev
```

4. **Open the URL shown in your terminal (usually `http://localhost:3000`)**

## Testing

1. Add brand URL (e.g., `https://nike.com`)
2. Add additional brief instructions (e.g., "image for a brand awareness campaign on social media") - Optional
3. Click generate image

## Project Structure

```text
app/
  globals.css          # Global styles
  layout.tsx           # Root layout component
  page.tsx             # Main page component with image generation UI
components/
  prompt-form.tsx      # Form component for brand URL and brief input
  code-block-card.tsx  # Component for displaying API endpoint code blocks
  loader-state.tsx     # Loading state component
  ui/                  # shadcn/ui components (button, card, form, etc.)
hooks/
  useImageGeneration.ts # Main hook managing image generation workflow state
lib/
  api-endpoints.ts     # API endpoint configuration and curl examples
  workflow-helpers.ts  # Helper functions for building API payloads
  utils.ts             # General utility functions
services/
  upriver.ts          # Upriver API client functions
  gemini.ts           # Gemini API client for prompt generation
  nano-banana.ts      # Nano Banana API client for image generation
  upriver-types.ts    # TypeScript types for Upriver API responses
```

## Built With

- [Gemini](https://ai.google.dev/)
- [Nano Banana](https://ai.google.dev/models/gemini)
- [Next.js](https://nextjs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

## Learn More

To learn more about Upriver, take a look at the following resources:

- [Upriver Website](https://upriver.ai?ref=banana)
- [Upriver Documentation](https://docs.upriver.ai?ref=banana)

To get an Upriver API key, email [support@upriver.ai](mailto:support@upriver.ai).
