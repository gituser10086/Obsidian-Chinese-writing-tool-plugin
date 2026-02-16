import { App, TAbstractFile, TFile, WorkspaceLeaf, MarkdownView } from "obsidian";

export function getFileExplorerLeaf(app: App): WorkspaceLeaf | null {
  const leaves = app.workspace.getLeavesOfType("file-explorer");
  if (!leaves.length) return null;
  return leaves[0];
}

export function updateExplorer(
  app: App,
  fileCounts: Map<string, number>,
  folderCounts: Map<string, number>,
  changedFile?: TAbstractFile
) {
  const leaf = getFileExplorerLeaf(app);
  if (!leaf) return;

  const view: any = leaf.view;
  const fileItems: { [path: string]: any } = view.fileItems;

  for (const path in fileItems) {
    if (
      changedFile &&
      !changedFile.path.includes(path) &&
      changedFile.path !== path
    ) {
      continue;
    }

    const item = fileItems[path];
    const el = item.titleEl ?? item.selfEl;

    const abstract = app.vault.getAbstractFileByPath(path);

    if (abstract instanceof TFile) {
      const count = fileCounts.get(path) ?? 0;
      el.setAttribute("data-word-count", ` (${count})`);
    } else {
      const count = folderCounts.get(path) ?? 0;
      el.setAttribute("data-word-count", ` (${count})`);
    }
  }
}

export function updateStatusBar(
  app: App,
  statusBarItem: HTMLElement,
  fileCounts: Map<string, number>
) {
  const view = app.workspace.getActiveViewOfType(MarkdownView);
  if (!view) {
    statusBarItem.setText("Characters: 0");
    return;
  }

  const file = view.file;
  if (!file) return;

  const count = fileCounts.get(file.path) ?? 0;
  statusBarItem.setText(`Characters: ${count}`);
}
