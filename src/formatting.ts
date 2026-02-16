// Formatting utilities for the Word Count plugin

export function formatContent(text: string): string {
  if (!text) return text;

  // Remove frontmatter (keep conservative: only top-level YAML blocks)
  text = text.replace(/^---[\s\S]*?---\s*/m, "");

  // Normalize CRLF to LF
  text = text.replace(/\r\n/g, "\n");

  // Protect fenced code blocks and inline code spans, then operate on non-code text.
  const codeFenceRegex = /^(```|~~~)/;

  // Extract inline code spans and replace with placeholders so we don't touch them
  const inlinePlaceholders: string[] = [];
  text = text.replace(/(`+)([\s\S]*?)(\1)/g, (m) => {
    const idx = inlinePlaceholders.push(m) - 1;
    return `@@INLINE_CODE_${idx}@@`;
  });

  const lines = text.split("\n");
  let inFence = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Toggle fenced code block state
    if (codeFenceRegex.test(line.trim())) {
      inFence = !inFence;
      continue;
    }

    if (inFence) continue; // leave fenced code block lines untouched

    // Preserve indented code (leading tab or 4+ spaces)
    if (/^(\t| {4,})/.test(line)) continue;

    // Preserve leading indentation exactly
    const leading = line.match(/^\s*/)?.[0] ?? "";
    let rest = line.slice(leading.length);

    // If line ends with exactly two spaces (markdown hard break), preserve them.
    const hasHardBreak = / {2}$/.test(rest);

    // Remove trailing spaces unless it's the hard break
    rest = rest.replace(/\s+$/g, hasHardBreak ? "  " : "");

    // Collapse multiple internal spaces to a single space
    rest = rest.replace(/ {2,}/g, " ");

    lines[i] = leading + rest;
  }

  text = lines.join("\n");

  // Collapse any run of one-or-more newlines into exactly two newlines
  text = text.replace(/\n+/g, "\n\n");

  // Trim leading/trailing newlines; do not append a trailing newline at EOF
  text = text.replace(/^\n+|\n+$/g, "");

  // Restore inline code placeholders
  text = text.replace(/@@INLINE_CODE_(\d+)@@/g, (_, n) => {
    return inlinePlaceholders[Number(n)];
  });

  return text;
}
