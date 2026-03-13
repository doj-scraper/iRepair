/**
 * Input Sanitization Utilities
 *
 * Provides server-safe and client-safe sanitization for user-generated
 * content, with special attention to MDX editor output. Uses DOMPurify
 * under the hood (isomorphic build for SSR compatibility).
 */

import DOMPurify from "isomorphic-dompurify";

// ─── Configuration ───────────────────────────────────────────────────────────

/**
 * Default DOMPurify configuration for MDX / rich-text content.
 * Allows a safe subset of HTML while stripping dangerous elements.
 */
const MDX_ALLOWED_TAGS = [
  // Block elements
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "blockquote", "pre", "code",
  "ul", "ol", "li",
  "table", "thead", "tbody", "tr", "th", "td",
  "hr", "br", "div", "span",
  // Inline elements
  "a", "strong", "em", "b", "i", "u", "s", "del", "ins",
  "sub", "sup", "mark", "small",
  // Media (images only — no iframes, scripts, objects)
  "img",
  // Details / summary
  "details", "summary",
];

const MDX_ALLOWED_ATTRS = [
  "href", "target", "rel", "title", "alt", "src",
  "width", "height", "class", "id",
  "colspan", "rowspan", "align",
  "open", // for <details>
];

const MDX_PURIFY_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: MDX_ALLOWED_TAGS,
  ALLOWED_ATTR: MDX_ALLOWED_ATTRS,
  ALLOW_DATA_ATTR: false,
  // Force all links to open in new tab with safe rel
  ADD_ATTR: ["target"],
};

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Sanitize MDX / rich-text editor content.
 *
 * Strips all potentially dangerous HTML (scripts, event handlers, iframes,
 * etc.) while preserving safe formatting tags.
 *
 * @param dirty - Raw HTML string from the MDX editor
 * @returns Sanitized HTML string
 */
export function sanitizeMdxContent(dirty: string): string {
  if (!dirty) return "";

  const clean = DOMPurify.sanitize(dirty, MDX_PURIFY_CONFIG);

  // Post-process: ensure all <a> tags have safe rel attributes
  return clean.replace(
    /<a\s/g,
    '<a rel="noopener noreferrer" '
  );
}

/**
 * Sanitize plain-text user input.
 *
 * Strips ALL HTML tags and decodes entities, returning only text content.
 * Suitable for names, emails, search queries, etc.
 *
 * @param dirty - Raw user input
 * @returns Plain text with no HTML
 */
export function sanitizePlainText(dirty: string): string {
  if (!dirty) return "";
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] }).trim();
}

/**
 * Sanitize and escape a string for safe inclusion in HTML attributes.
 */
export function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Remove potential NoSQL / SQL injection patterns from a search string.
 * This is a defence-in-depth measure — Prisma parameterises queries, but
 * we strip obvious attack patterns anyway.
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query) return "";
  return query
    .replace(/[{}$]/g, "") // Remove MongoDB-style operators
    .replace(/['";\\]/g, "") // Remove SQL-injection characters
    .replace(/--/g, "") // Remove SQL comments
    .replace(/\/\*/g, "") // Remove block comment starts
    .trim()
    .slice(0, 200); // Cap length
}

/**
 * Validate and sanitize a URL string. Returns the URL if valid and uses
 * an allowed protocol, otherwise returns an empty string.
 */
export function sanitizeUrl(url: string): string {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    if (!["http:", "https:", "mailto:"].includes(parsed.protocol)) {
      return "";
    }
    return parsed.toString();
  } catch {
    return "";
  }
}
