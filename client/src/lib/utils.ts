import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortSentence(text: string) {
  const clean = text.trim()
  if (!clean) return ""

  const first = clean
    .split(".")
    .map((part) => part.trim())
    .find(Boolean)

  if (!first || !clean.includes(".")) return clean

  return `${first}.`
}
