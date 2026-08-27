import type { Plugin } from "obsidian";
import { insertChineseQuotes } from "./insertChineseQuotes";

export function registerCommands(plugin: Plugin): void {
  plugin.addCommand({
    id: "insert-chinese-double-quotes",
    name: "Insert Chinese double quotes",
    editorCallback: insertChineseQuotes,
  });
}
