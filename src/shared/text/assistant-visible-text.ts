import { findCodeRegions, isInsideCode } from "./code-regions.js";
import { stripReasoningTagsFromText } from "./reasoning-tags.js";

const MEMORY_TAG_RE = /<\s*(\/?)\s*relevant[-_]memories\b[^<>]*>/gi;
const MEMORY_TAG_QUICK_RE = /<\s*\/?\s*relevant[-_]memories\b/i;

const SESSION_RECAP_TAG_RE = /<\s*(\/?)\s*session[-_]recap\b[^<>]*>/gi;
const SESSION_RECAP_TAG_QUICK_RE = /<\s*\/?\s*session[-_]recap\b/i;

function stripRelevantMemoriesTags(text: string): string {
  if (!text || !MEMORY_TAG_QUICK_RE.test(text)) {
    return text;
  }
  MEMORY_TAG_RE.lastIndex = 0;

  const codeRegions = findCodeRegions(text);
  let result = "";
  let lastIndex = 0;
  let inMemoryBlock = false;

  for (const match of text.matchAll(MEMORY_TAG_RE)) {
    const idx = match.index ?? 0;
    if (isInsideCode(idx, codeRegions)) {
      continue;
    }

    const isClose = match[1] === "/";
    if (!inMemoryBlock) {
      result += text.slice(lastIndex, idx);
      if (!isClose) {
        inMemoryBlock = true;
      }
    } else if (isClose) {
      inMemoryBlock = false;
    }

    lastIndex = idx + match[0].length;
  }

  if (!inMemoryBlock) {
    result += text.slice(lastIndex);
  }

  return result;
}

function stripSessionRecapTags(text: string): string {
  if (!text || !SESSION_RECAP_TAG_QUICK_RE.test(text)) {
    return text;
  }
  SESSION_RECAP_TAG_RE.lastIndex = 0;

  const codeRegions = findCodeRegions(text);
  let result = "";
  let lastIndex = 0;
  let inRecapBlock = false;

  for (const match of text.matchAll(SESSION_RECAP_TAG_RE)) {
    const idx = match.index ?? 0;
    if (isInsideCode(idx, codeRegions)) {
      continue;
    }

    const isClose = match[1] === "/";
    if (!inRecapBlock) {
      result += text.slice(lastIndex, idx);
      if (!isClose) {
        inRecapBlock = true;
      }
    } else if (isClose) {
      inRecapBlock = false;
    }

    lastIndex = idx + match[0].length;
  }

  if (!inRecapBlock) {
    result += text.slice(lastIndex);
  }

  return result;
}

export function stripAssistantInternalScaffolding(text: string): string {
  const withoutReasoning = stripReasoningTagsFromText(text, { mode: "preserve", trim: "start" });
  const withoutMemories = stripRelevantMemoriesTags(withoutReasoning);
  return stripSessionRecapTags(withoutMemories).trimStart();
}
