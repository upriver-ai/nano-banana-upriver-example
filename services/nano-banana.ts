import { GoogleGenAI } from "@google/genai";

const DEFAULT_MODEL = "gemini-3-pro-image-preview";

export interface GenerateImageOptions {
  prompt: string;
  model?: string;
}

export interface GenerateImageResult {
  dataUrl: string;
  mimeType: string;
}

export async function generateImage(
  options: GenerateImageOptions
): Promise<GenerateImageResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = options.model || DEFAULT_MODEL;

  const response = await ai.models.generateContent({
    model,
    contents: options.prompt,
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
