import { describe, expect, it } from "vitest";
import { stripAssistantInternalScaffolding } from "./assistant-visible-text.js";

describe("stripAssistantInternalScaffolding", () => {
  it("strips reasoning tags", () => {
    const input = ["<thinking>", "secret", "</thinking>", "Visible"].join("\n");
    expect(stripAssistantInternalScaffolding(input)).toBe("Visible");
  });

  it("strips relevant-memories scaffolding blocks", () => {
    const input = [
      "<relevant-memories>",
      "The following memories may be relevant to this conversation:",
      "- Internal memory note",
      "</relevant-memories>",
      "",
      "User-visible answer",
    ].join("\n");
    expect(stripAssistantInternalScaffolding(input)).toBe("User-visible answer");
  });

  it("supports relevant_memories tag variants", () => {
    const input = [
      "<relevant_memories>",
      "Internal memory note",
      "</relevant_memories>",
      "Visible",
    ].join("\n");
    expect(stripAssistantInternalScaffolding(input)).toBe("Visible");
  });

  it("keeps relevant-memories tags inside fenced code", () => {
    const input = [
      "```xml",
      "<relevant-memories>",
      "sample",
      "</relevant-memories>",
      "```",
      "",
      "Visible text",
    ].join("\n");
    expect(stripAssistantInternalScaffolding(input)).toBe(input);
  });

  it("hides unfinished relevant-memories blocks", () => {
    const input = ["Hello", "<relevant-memories>", "internal-only"].join("\n");
    expect(stripAssistantInternalScaffolding(input)).toBe("Hello\n");
  });

  it("strips session-recap scaffolding blocks", () => {
    const input = [
      "<session-recap>",
      "<summary>Found 10 recent items</summary>",
      '<ledger-items count="2">',
      '  <item path="ledger/2026-03-09.md">test</item>',
      "</ledger-items>",
      "</session-recap>",
      "",
      "User-visible answer",
    ].join("\n");
    expect(stripAssistantInternalScaffolding(input)).toBe("User-visible answer");
  });

  it("supports session_recap underscore variant", () => {
    const input = ["<session_recap>", "Internal recap note", "</session_recap>", "Visible"].join(
      "\n",
    );
    expect(stripAssistantInternalScaffolding(input)).toBe("Visible");
  });

  it("keeps session-recap tags inside fenced code", () => {
    const input = [
      "```xml",
      "<session-recap>",
      "sample",
      "</session-recap>",
      "```",
      "",
      "Visible text",
    ].join("\n");
    expect(stripAssistantInternalScaffolding(input)).toBe(input);
  });

  it("hides unfinished session-recap blocks", () => {
    const input = ["Hello", "<session-recap>", "internal-only"].join("\n");
    expect(stripAssistantInternalScaffolding(input)).toBe("Hello\n");
  });
});
