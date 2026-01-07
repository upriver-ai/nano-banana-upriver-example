import { NextRequest, NextResponse } from "next/server";
import { getBrandDetails } from "@/services/upriver";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brand_url, brand_name, auto } = body;

    if (!brand_url && !brand_name && !auto) {
      return NextResponse.json(
        { error: "brand_url, brand_name, or auto is required" },
        { status: 400 }
      );
    }

    const result = await getBrandDetails({
      brand_url,
      brand_name,
      auto,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching brand research:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch brand research",
      },
      { status: 500 }
    );
  }
}

