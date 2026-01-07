import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatJsonForDisplay(data: unknown): string {
  return JSON.stringify(data, null, 2)
}
