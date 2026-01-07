# Upriver x Nano Banana Example

A working example of an image generation workflow combining [Upriver](https://upriver.ai?ref=banana) and Nano Banana. This application uses the following endpoints from Upriver:

- [Brand Details](https://docs.upriver.ai/api-reference/brands/brand-details?ref=banana) - Brand information including industry, values, and mission
- [Brand Products](https://docs.upriver.ai/api-reference/products/products?ref=banana) - Products associated with a brand
- [Audience Insights](https://docs.upriver.ai/api-reference/audience/insights?ref=banana) - Relevant audience insights for a specified brand and/or product
- [Audience Insight Citations](https://docs.upriver.ai/api-reference/audience/insights-citations?ref=banana) - Real-world evidence for audience insights

## Built With

- [Gemini](https://ai.google.dev/) - Google's AI model for prompt generation
- [Nano Banana](https://ai.google.dev/models/gemini) - Google's Gemini image generation model
- [Next.js](https://nextjs.org) - React framework
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com) - UI component library

## Getting Started

### Prerequisites

You'll need API keys for both services:

- **Gemini API Key**: Get your key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Upriver API Key**: Email [support@upriver.ai](mailto:support@upriver.ai) to get an API key

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
UPRIVER_API_KEY=your_upriver_api_key_here
```

### Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Learn More

To learn more about Upriver, take a look at the following resources:

- [Upriver Website](https://upriver.ai?ref=banana)
- [Upriver Documentation](https://docs.upriver.ai?ref=banana)

To get an API key, email us at [support@upriver.ai](mailto:support@upriver.ai)
