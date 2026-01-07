import { NextRequest, NextResponse } from "next/server";
import { getInsightCitations } from "@/services/upriver";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const continuationToken = searchParams.get("continuation_token");

    if (!continuationToken) {
      return NextResponse.json(
        { error: "continuation_token is required" },
        { status: 400 }
      );
    }

    const result = await getInsightCitations({
      continuation_token: continuationToken,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching insight citations:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch insight citations",
      },
      { status: 500 }
    );
  }
}

