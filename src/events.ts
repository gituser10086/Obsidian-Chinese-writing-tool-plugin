import { TFile, Notice } from "obsidian";
import ChineseWritingToolPlugin from "./main";
import { formatContent } from "./formatting";
import { getFileExplorerLeaf } from "./ui";

export function registerAllEvents(plugin: ChineseWritingToolPlugin, debouncedRecount: (file: TFile) => void) {
  // Active leaf change (status bar)
  plugin.registerEvent(
    plugin.app.workspace.on("active-leaf-change", () => {
      plugin.updateStatusBar();
    })
  );

  // Layout change — re-render counts when the file explorer appears
  // (e.g., user opens the sidebar after plugin load)
  plugin.registerEvent(
    plugin.app.workspace.on("layout-change", () => {
      if (getFileExplorerLeaf(plugin.app)) {
        plugin.updateExplorer();
      }
    })
  );

  // Live typing tracking
  plugin.registerEvent(
    plugin.app.metadataCache.on("changed", (file) => {
      if (file instanceof TFile) {
        debouncedRecount(file);
      }
    })
  );

  // File created
  plugin.registerEvent(
    plugin.app.vault.on("create", async (file) => {
      if (file instanceof TFile) {
        await plugin.recalculateFile(file);
        plugin.updateExplorer(file);
      }
    })
  );

  // File modified (external/save)
  plugin.registerEvent(
    plugin.app.vault.on("modify", (file) => {
      if (file instanceof TFile) {
        debouncedRecount(file);
      }
    })
  );

  // File deleted
  plugin.registerEvent(
    plugin.app.vault.on("delete", (file) => {
      if (file instanceof TFile) {
        plugin.removeFile(file.path);
        plugin.updateExplorer(file);
      }
    })
  );

  // File renamed / moved
  plugin.registerEvent(
    plugin.app.vault.on("rename", async (file, oldPath) => {
      if (file instanceof TFile) {
        await plugin.handleRename(file, oldPath);
        plugin.updateExplorer(file);
      }
    })
  );

  // File tab menu (top-right of file tab)
  plugin.registerEvent(
    plugin.app.workspace.on("file-menu", (menu, file) => {
      menu.addItem((item) => {
        item.setTitle("Formatting").onClick(async () => {
          if (file instanceof TFile) {
            const content = await plugin.app.vault.read(file);
            const formatted = formatContent(content);
            if (formatted !== content) {
              await plugin.app.vault.modify(file, formatted);
              await plugin.recalculateFile(file);
              plugin.updateExplorer(file);
              new Notice("Formatted file");
            } else {
              new Notice("No formatting changes required");
            }
          }
        });
      });
    })
  );
}
