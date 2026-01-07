import type { GeneratePromptOptions, GeneratePromptResult } from "./gemini";

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `API error: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}

export async function generateImagePrompt(
  options: GeneratePromptOptions
): Promise<GeneratePromptResult> {
  return fetchApi<GeneratePromptResult>("/api/generate-prompt", {
    method: "POST",
    body: JSON.stringify(options),
  });
}
