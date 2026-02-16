import { Plugin, TFile, Notice } from "obsidian";
import { formatContent } from "./formatting";

export function registerAllEvents(plugin: Plugin, debouncedRecount: (file: TFile) => void) {
  // Active leaf change (status bar)
  plugin.registerEvent(
    plugin.app.workspace.on("active-leaf-change", () => {
      (plugin as any).updateStatusBar();
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
        await (plugin as any).recalculateFile(file);
        (plugin as any).updateExplorer(file);
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
        (plugin as any).removeFile(file.path);
        (plugin as any).updateExplorer(file);
      }
    })
  );

  // File renamed / moved
  plugin.registerEvent(
    plugin.app.vault.on("rename", async (file, oldPath) => {
      if (file instanceof TFile) {
        await (plugin as any).handleRename(file, oldPath);
        (plugin as any).updateExplorer(file);
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
              await (plugin as any).recalculateFile(file);
              (plugin as any).updateExplorer(file);
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
