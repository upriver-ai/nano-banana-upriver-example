import type {
  GenerateImageOptions,
  GenerateImageResult,
} from "./nano-banana";

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

export async function generateImage(
  options: GenerateImageOptions
): Promise<GenerateImageResult> {
  return fetchApi<GenerateImageResult>("/api/generate-image", {
    method: "POST",
    body: JSON.stringify(options),
  });
}

