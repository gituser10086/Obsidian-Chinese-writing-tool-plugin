import type { Editor } from "obsidian";

export function insertChineseQuotes(editor: Editor): void {
  const selection = editor.getSelection();

  if (selection) {
    editor.replaceSelection(`“${selection}”`);
    return;
  }

  const cursor = editor.getCursor();
  editor.replaceRange("“”", cursor);
  editor.setCursor({
    line: cursor.line,
    ch: cursor.ch + 1,
  });
}
