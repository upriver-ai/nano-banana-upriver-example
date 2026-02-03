"use server";

import { GoogleGenAI } from "@google/genai";

const DEFAULT_MODEL = "gemini-3-pro-image-preview";

export interface GenerateImageOptions {
  prompt: string;
  model?: string;
  referenceImageUrls?: string[];
}

export interface GenerateImageResult {
  dataUrl: string;
  mimeType: string;
}

async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string }> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image from ${url}: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString('base64');
  const mimeType = response.headers.get('content-type') || 'image/jpeg';

  return { data: base64, mimeType };
}

export async function generateImage(
  options: GenerateImageOptions,
  apiKey?: string
): Promise<GenerateImageResult> {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not set. Please provide an API key in settings or set the environment variable.");
  }

  const ai = new GoogleGenAI({ apiKey: key });
  const model = options.model || DEFAULT_MODEL;

  // Build contents array with prompt and optional reference images
  const contentParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

  // Add reference images first if provided
  if (options.referenceImageUrls && options.referenceImageUrls.length > 0) {
    for (const imageUrl of options.referenceImageUrls) {
      try {
        const { data, mimeType } = await fetchImageAsBase64(imageUrl);
        contentParts.push({
          inlineData: {
            mimeType,
            data,
          },
        });
      } catch (error) {
        console.warn(`Failed to fetch reference image ${imageUrl}:`, error);
        // Continue with other images even if one fails
      }
    }
  }

  // Add text prompt
  contentParts.push({ text: options.prompt });

  const response = await ai.models.generateContent({
    model,
    contents: contentParts,
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      const mimeType = part.inlineData.mimeType || "image/png";
      const dataUrl = `data:${mimeType};base64,${part.inlineData.data}`;

      return {
        dataUrl,
        mimeType,
      };
    }
  }

  throw new Error("No image data found in response");
}
