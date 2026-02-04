# CLAUDE.md

## Project Overview

A Next.js example application demonstrating Upriver API (brand intelligence/audience research) integration with Google Gemini API for on-brand image generation. Users input a brand URL and brief, the app fetches brand research, products, and audience insights from Upriver, uses AI to select the best product for visual storytelling, then uses Gemini to generate an optimized image prompt and produce lifestyle imagery featuring that product.

## Commands

```bash
npm run dev      # Start development server at localhost:3000
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test suite is configured.

## Architecture

### Tech Stack
- Next.js 16 (App Router) with React 19
- TypeScript (strict mode)
- Tailwind CSS with shadcn/ui components
- Server functions (`"use server"`) for API calls

### Data Flow
```
User Input (Brand URL + Brief)
         ↓
useImageGeneration Hook (orchestrator)
         ↓
    ┌────┴─────────────────────┐
    ↓                           ↓
Upriver Services            Gemini Services
├─ getBrandDetails()        ├─ selectProduct() (AI selection)
├─ getProducts()            ├─ generateImagePrompt()
├─ getProductDetails()      └─ generateImage()
├─ getAudienceInsights()
└─ getInsightCitations()
         ↓
   AI selects best product for visual potential
         ↓
   Brand + Audience + Product data → Gemini prompt
         ↓
   Generated Lifestyle Image
```

### Key Files
- `app/page.tsx` - Main UI with resizable two-panel layout
- `hooks/useImageGeneration.ts` - Central state management for the multi-step workflow
- `services/upriver.ts` - Upriver API client (server-side, uses `UPRIVER_API_KEY`)
- `services/gemini.ts` - Gemini API client (server-side, uses `GEMINI_API_KEY`)
- `services/nano-banana.ts` - Nano Banana image generation service
- `prompts/image-generation-prompt.ts` - LLM prompt builder for image generation
- `prompts/product-selection-prompt.ts` - LLM prompt builder for product selection
- `lib/workflow-helpers.ts` - Payload builders and data extractors
- `lib/api-keys.ts` - API keys storage and retrieval utilities

### Environment Variables
```
GEMINI_API_KEY=...
UPRIVER_API_KEY=...
```

## Code Patterns

- Server functions in `/services` use `"use server"` directive - API keys stay server-side
- `Promise.allSettled` used for parallel API calls to handle partial failures gracefully
- Path alias `@/*` maps to project root (e.g., `@/components`, `@/lib`, `@/prompts`)
- shadcn/ui components in `components/ui/` with New York style variant
- LLM prompts extracted to `/prompts` folder for easy customer customization
- AI-based product selection for optimal visual storytelling

## Customizing Image Generation

### Prompt Customization
All LLM prompts are located in the `prompts/` folder:

- **`prompts/image-generation-prompt.ts`** - Main prompt builder for generating lifestyle imagery
  - Customizable sections: system role, scene guidance, product integration, audience emphasis
  - Exported function: `buildImageGenerationPrompt(options)`

- **`prompts/product-selection-prompt.ts`** - Prompt builder for AI product selection
  - Customizable sections: selection criteria, brand context weighting
  - Exported function: `buildProductSelectionPrompt(options)`

See `prompts/README.md` for detailed customization guidance.

### Upriver API Endpoints Used
1. **`/brand/research`** - Brand identity, mission, values, voice
2. **`/brand/products`** - Product catalog for the brand
3. **`/brand/product`** - Detailed product info including images and features
4. **`/audience_insights`** - Target audience personas, motivations, triggers
5. **`/audience_insights/{token}/citations`** - Real-world evidence for insights

### Workflow Steps
1. User submits brand URL and optional brief
2. Parallel fetch: brand details + products list
3. AI selects best product using Gemini (via `selectProduct()`)
4. Fetch detailed product info including reference images
5. Fetch audience insights + citations
6. Generate optimized image prompt combining all data
7. Generate lifestyle image using Gemini with product reference image
