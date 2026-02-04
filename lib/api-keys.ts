const STORAGE_KEY = "upriver-nano-banana-api-keys";

export interface ApiKeys {
  upriverApiKey: string;
  geminiApiKey: string;
}

export function getStoredApiKeys(): ApiKeys {
  if (typeof window === "undefined") {
    return { upriverApiKey: "", geminiApiKey: "" };
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return { upriverApiKey: "", geminiApiKey: "" };
    }
  }
  return { upriverApiKey: "", geminiApiKey: "" };
}

export function saveApiKeys(keys: Partial<ApiKeys>) {
  const current = getStoredApiKeys();
  const updated = { ...current, ...keys };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function clearApiKeys() {
  localStorage.removeItem(STORAGE_KEY);
}
