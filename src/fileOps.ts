import { TFile } from "obsidian";
import { countCharacters } from "./count";

export async function initializeCounts(app: any, fileCounts: Map<string, number>, folderCounts: Map<string, number>, recalculateFile: (file: TFile, updateUI?: boolean) => Promise<void>) {
  const files = app.vault.getMarkdownFiles();
  for (const file of files) {
    await recalculateFile(file, false);
  }
}

export async function recalculateFile(app: any, fileCounts: Map<string, number>, folderCounts: Map<string, number>, file: TFile, updateParentFolders: (path: string, delta: number) => void, updateUI = false, updateExplorer?: (file: TFile) => void) {
  const oldCount = fileCounts.get(file.path) ?? 0;
  const content = await app.vault.read(file);
  const newCount = countCharacters(content);
  fileCounts.set(file.path, newCount);
  const delta = newCount - oldCount;
  updateParentFolders(file.path, delta);
  if (updateUI && updateExplorer) updateExplorer(file);
}

export function removeFile(fileCounts: Map<string, number>, folderCounts: Map<string, number>, path: string, updateParentFolders: (path: string, delta: number) => void) {
  const count = fileCounts.get(path);
  if (!count) return;
  fileCounts.delete(path);
  updateParentFolders(path, -count);
}

export async function handleRename(app: any, fileCounts: Map<string, number>, folderCounts: Map<string, number>, file: TFile, oldPath: string, updateParentFolders: (path: string, delta: number) => void, recalculateFile: (file: TFile, updateUI?: boolean) => Promise<void>) {
  const oldCount = fileCounts.get(oldPath) ?? 0;
  updateParentFolders(oldPath, -oldCount);
  fileCounts.delete(oldPath);
  await recalculateFile(file, false);
}

export function updateParentFolders(folderCounts: Map<string, number>, path: string, delta: number) {
  const parts = path.split("/");
  for (let i = 1; i < parts.length; i++) {
    const folderPath = parts.slice(0, i).join("/");
    const current = folderCounts.get(folderPath) ?? 0;
    folderCounts.set(folderPath, current + delta);
  }
}
