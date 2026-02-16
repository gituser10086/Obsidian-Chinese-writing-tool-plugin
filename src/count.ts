// Character counting utilities for the Word Count plugin

export function countCharacters(text: string): number {
  if (!text) return 0;

  // Remove frontmatter (conservative: only top-level YAML blocks)
  text = text.replace(/^---[\s\S]*?---\s*/m, "");

  // Normalize CRLF to LF
  text = text.replace(/\r\n/g, "\n");

  // Remove fenced code markers but keep code content
  text = text.replace(/^(```|~~~).*$/gm, "");

  // Replace image syntax: ![alt](url) -> alt
  text = text.replace(/!\[([^\]]*)\]\([^\)]*\)/g, "$1");

  // Replace links: [text](url) -> text
  text = text.replace(/\[([^\]]+)\]\([^\)]*\)/g, "$1");

  // Replace autolinks <...> -> inner
  text = text.replace(/<([^>]+)>/g, "$1");

  // Unwrap inline code `code` -> code
  text = text.replace(/(`+)([^`]*?)\1/g, "$2");

  // Remove emphasis/strong/strikethrough markers but keep content
  text = text.replace(/\*\*(.*?)\*\*/g, "$1");
  text = text.replace(/__(.*?)__/g, "$1");
  text = text.replace(/\*(.*?)\*/g, "$1");
  text = text.replace(/_(.*?)_/g, "$1");
  text = text.replace(/~~(.*?)~~/g, "$1");

  // Remove heading markers, blockquote markers, list markers, and horizontal rules
  text = text.replace(/^#+\s*/gm, "");
  text = text.replace(/^>\s?/gm, "");
  text = text.replace(/^([-+*]|\d+\.)\s+/gm, "");
  text = text.replace(/^(-{3,}|_{3,}|\*{3,})$/gm, "");

  // Remove any remaining brackets or parentheses used for markup
  text = text.replace(/[\[\]\(\)]/g, "");

  // Optionally remove HTML tags
  text = text.replace(/<[^>]+>/g, "");

  // Remove backslash used as Markdown escape (e.g. \* -> *) so the backslash is not counted
  text = text.replace(/\\([\\`*_{}\[\]()#+\-.!>])/g, "$1");

  // Finally remove all whitespace characters for character-only count
  text = text.replace(/\s/g, "");

  return text.length;
}
