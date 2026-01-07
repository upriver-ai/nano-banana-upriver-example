import { NextRequest, NextResponse } from "next/server";
import { getAudienceInsights } from "@/services/upriver";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brief, industries, brand, product, audience } = body;

    const result = await getAudienceInsights({
      brief,
      industries,
      brand,
      product,
      audience,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching audience insights:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch audience insights",
      },
      { status: 500 }
    );
  }
}

