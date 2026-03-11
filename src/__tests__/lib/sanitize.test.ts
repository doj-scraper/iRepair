/**
 * Unit Tests — Input Sanitization
 */

import { describe, it, expect } from "vitest";
import {
  sanitizeMdxContent,
  sanitizePlainText,
  escapeHtmlAttr,
  sanitizeSearchQuery,
  sanitizeUrl,
} from "@/lib/sanitize";

// ─── MDX Content Sanitization ────────────────────────────────────────────────

describe("sanitizeMdxContent", () => {
  it("preserves safe HTML tags", () => {
    const input = "<h1>Title</h1><p>Paragraph with <strong>bold</strong></p>";
    const result = sanitizeMdxContent(input);
    expect(result).toContain("<h1>");
    expect(result).toContain("<strong>");
    expect(result).toContain("<p>");
  });

  it("strips script tags", () => {
    const input = '<p>Safe</p><script>alert("xss")</script>';
    const result = sanitizeMdxContent(input);
    expect(result).not.toContain("<script>");
    expect(result).not.toContain("alert");
    expect(result).toContain("Safe");
  });

  it("strips event handlers", () => {
    const input = '<img src="x" onerror="alert(1)" />';
    const result = sanitizeMdxContent(input);
    expect(result).not.toContain("onerror");
  });

  it("strips iframe tags", () => {
    const input = '<iframe src="https://evil.com"></iframe>';
    const result = sanitizeMdxContent(input);
    expect(result).not.toContain("<iframe>");
  });

  it("preserves code blocks", () => {
    const input = "<pre><code>const x = 1;</code></pre>";
    const result = sanitizeMdxContent(input);
    expect(result).toContain("<pre>");
    expect(result).toContain("<code>");
  });

  it("preserves tables", () => {
    const input =
      "<table><thead><tr><th>Header</th></tr></thead><tbody><tr><td>Cell</td></tr></tbody></table>";
    const result = sanitizeMdxContent(input);
    expect(result).toContain("<table>");
    expect(result).toContain("<th>");
    expect(result).toContain("<td>");
  });

  it("returns empty string for empty input", () => {
    expect(sanitizeMdxContent("")).toBe("");
    expect(sanitizeMdxContent(null as unknown as string)).toBe("");
  });

  it("adds rel=noopener noreferrer to links", () => {
    const input = '<a href="https://example.com">Link</a>';
    const result = sanitizeMdxContent(input);
    expect(result).toContain("noopener noreferrer");
  });
});

// ─── Plain Text Sanitization ─────────────────────────────────────────────────

describe("sanitizePlainText", () => {
  it("strips all HTML tags", () => {
    const input = "<b>Bold</b> <script>alert(1)</script> text";
    const result = sanitizePlainText(input);
    expect(result).not.toContain("<");
    expect(result).not.toContain(">");
    expect(result).toContain("Bold");
    expect(result).toContain("text");
  });

  it("returns empty string for empty input", () => {
    expect(sanitizePlainText("")).toBe("");
  });

  it("trims whitespace", () => {
    expect(sanitizePlainText("  hello  ")).toBe("hello");
  });
});

// ─── HTML Attribute Escaping ─────────────────────────────────────────────────

describe("escapeHtmlAttr", () => {
  it("escapes special characters", () => {
    expect(escapeHtmlAttr('He said "hello" & <goodbye>')).toBe(
      "He said &quot;hello&quot; &amp; &lt;goodbye&gt;"
    );
  });

  it("escapes single quotes", () => {
    expect(escapeHtmlAttr("it's")).toBe("it&#39;s");
  });
});

// ─── Search Query Sanitization ───────────────────────────────────────────────

describe("sanitizeSearchQuery", () => {
  it("removes MongoDB-style operators", () => {
    expect(sanitizeSearchQuery('{"$gt": 1}')).not.toContain("$");
    expect(sanitizeSearchQuery('{"$gt": 1}')).not.toContain("{");
  });

  it("removes SQL injection characters", () => {
    expect(sanitizeSearchQuery("'; DROP TABLE users;--")).not.toContain("'");
    expect(sanitizeSearchQuery("'; DROP TABLE users;--")).not.toContain(";");
    expect(sanitizeSearchQuery("'; DROP TABLE users;--")).not.toContain("--");
  });

  it("caps length at 200 characters", () => {
    const longQuery = "a".repeat(300);
    expect(sanitizeSearchQuery(longQuery).length).toBeLessThanOrEqual(200);
  });

  it("returns empty string for empty input", () => {
    expect(sanitizeSearchQuery("")).toBe("");
  });

  it("preserves normal search terms", () => {
    expect(sanitizeSearchQuery("iPhone 15 screen")).toBe("iPhone 15 screen");
  });
});

// ─── URL Sanitization ────────────────────────────────────────────────────────

describe("sanitizeUrl", () => {
  it("accepts valid https URLs", () => {
    expect(sanitizeUrl("https://example.com")).toBe("https://example.com/");
  });

  it("accepts valid http URLs", () => {
    expect(sanitizeUrl("http://example.com")).toBe("http://example.com/");
  });

  it("accepts mailto URLs", () => {
    expect(sanitizeUrl("mailto:user@example.com")).toBe(
      "mailto:user@example.com"
    );
  });

  it("rejects javascript: URLs", () => {
    expect(sanitizeUrl("javascript:alert(1)")).toBe("");
  });

  it("rejects data: URLs", () => {
    expect(sanitizeUrl("data:text/html,<script>alert(1)</script>")).toBe("");
  });

  it("returns empty string for invalid URLs", () => {
    expect(sanitizeUrl("not a url")).toBe("");
  });

  it("returns empty string for empty input", () => {
    expect(sanitizeUrl("")).toBe("");
  });
});
