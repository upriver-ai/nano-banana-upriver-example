# CLAUDE.md

## Project Overview

A Next.js example application demonstrating Upriver API (brand intelligence/audience research) integration with Google Gemini API for on-brand image generation. Users input a brand URL and brief, the app fetches brand research, products, and audience insights from Upriver, then uses Gemini to generate an optimized image prompt and produce an image.

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
    ┌────┴────────────────┐
    ↓                     ↓
Upriver Services       Gemini Services
├─ getBrandDetails()   ├─ generateImagePrompt()
├─ getProducts()       └─ generateImage()
├─ getAudienceInsights()
└─ getInsightCitations()
         ↓
   Combined into Gemini prompt
         ↓
   Generated Image
```

### Key Files
- `app/page.tsx` - Main UI with resizable two-panel layout
- `hooks/useImageGeneration.ts` - Central state management for the multi-step workflow
- `services/upriver.ts` - Upriver API client (server-side, uses `UPRIVER_API_KEY`)
- `services/gemini.ts` - Gemini API client (server-side, uses `GEMINI_API_KEY`)
- `lib/workflow-helpers.ts` - Payload builders and data extractors

### Environment Variables
```
GEMINI_API_KEY=...
UPRIVER_API_KEY=...
```

## Code Patterns

- Server functions in `/services` use `"use server"` directive - API keys stay server-side
- `Promise.allSettled` used for parallel API calls to handle partial failures gracefully
- Path alias `@/*` maps to project root (e.g., `@/components`, `@/lib`)
- shadcn/ui components in `components/ui/` with New York style variant
