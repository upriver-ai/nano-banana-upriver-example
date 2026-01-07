import { NextRequest, NextResponse } from "next/server";
import { generateImagePrompt } from "@/services/gemini";
import type { GeneratePromptOptions } from "@/services/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      brandUrl,
      additionalInstructions,
      brandResearch,
      products,
      audienceInsights,
      audienceInsightsCitations,
    } = body;

    if (brandUrl && typeof brandUrl !== "string") {
      return NextResponse.json(
        { error: "brandUrl must be a string if provided" },
        { status: 400 }
      );
    }

    const options: GeneratePromptOptions = {
      brandUrl: brandUrl || "",
      additionalInstructions:
        additionalInstructions && typeof additionalInstructions === "string"
          ? additionalInstructions
          : undefined,
      brandResearch: brandResearch || null,
      products: products || null,
      audienceInsights: audienceInsights || null,
      audienceInsightsCitations: audienceInsightsCitations || null,
    };

    const result = await generateImagePrompt(options);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating prompt:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate prompt",
      },
      { status: 500 }
    );
  }
}

