// filepath: /Users/mali8/M-Ali/gemini-file-search-manager/lib/openai.ts
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn("OPENAI_API_KEY is not set in environment variables");
}

export const openai = apiKey ? new OpenAI({ apiKey }) : null;

export function getOpenAI(): OpenAI {
  if (!openai) {
    throw new Error(
      "OPENAI_API_KEY is not configured. Please add it to your .env.local file."
    );
  }
  return openai;
}

export const SUPPORTED_MODELS = [
  { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
  { id: "gpt-4", name: "GPT-4" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
] as const;

export const DEFAULT_MODEL = "gpt-4-turbo";
