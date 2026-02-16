import {
  Plugin,
  MarkdownView,
  TFile,
  TAbstractFile,
  WorkspaceLeaf,
  Notice,
} from "obsidian";

import { formatContent } from "./formatting";
import { countCharacters } from "./count";
import { updateExplorer as uiUpdateExplorer, updateStatusBar as uiUpdateStatusBar } from "./ui";
import * as fileOps from "./fileOps";
import { registerAllEvents } from "./events";

interface FileItem {
  titleEl?: HTMLElement;
  selfEl: HTMLElement;
}

export default class ChineseNovelFormattingPlugin extends Plugin {
  statusBarItem: HTMLElement;

  // ===== CACHE =====
  fileCounts: Map<string, number> = new Map();
  folderCounts: Map<string, number> = new Map();

  async onload() {
    console.log("Chinese novel fomatting plugin Loaded");

    // ===== STATUS BAR =====
    this.statusBarItem = this.addStatusBarItem();
    this.statusBarItem.setText("Characters: 0");

    // ===== DEBOUNCED FILE UPDATE =====
    const debouncedRecount = this.debounceAsync(async (file: TFile) => {
      await this.recalculateFile(file);
      this.updateExplorer(file);
      this.updateStatusBar();
    }, 500);

    // Register all events in external module
    registerAllEvents(this, debouncedRecount);

    // ===== INITIAL SCAN =====
    await this.initializeCounts();
    this.updateExplorer();
    this.updateStatusBar();
  }

  // =========================
  // INITIALIZE
  // =========================

  async initializeCounts() {
    await fileOps.initializeCounts(
      this.app,
      this.fileCounts,
      this.folderCounts,
      this.recalculateFile.bind(this)
    );
  }

  // =========================
  // FILE COUNTING (INCREMENTAL)
  // =========================

  async recalculateFile(file: TFile, updateUI = false) {
    await fileOps.recalculateFile(
      this.app,
      this.fileCounts,
      this.folderCounts,
      file,
      this.updateParentFolders.bind(this),
      updateUI,
      this.updateExplorer.bind(this)
    );
  }

  removeFile(path: string) {
    fileOps.removeFile(
      this.fileCounts,
      this.folderCounts,
      path,
      this.updateParentFolders.bind(this)
    );
  }

  async handleRename(file: TFile, oldPath: string) {
    await fileOps.handleRename(
      this.app,
      this.fileCounts,
      this.folderCounts,
      file,
      oldPath,
      this.updateParentFolders.bind(this),
      this.recalculateFile.bind(this)
    );
  }

  updateParentFolders(path: string, delta: number) {
    fileOps.updateParentFolders(this.folderCounts, path, delta);
  }

  

  // =========================
  // RENDERING (PARTIAL UPDATE)
  // =========================

  updateExplorer(changedFile?: TAbstractFile) {
    uiUpdateExplorer(this.app, this.fileCounts, this.folderCounts, changedFile);
  }

  getFileExplorerLeaf(): WorkspaceLeaf | null {
    // Delegated to ui helper; keep for backward compatibility
    return null;
  }

  // =========================
  // STATUS BAR
  // =========================

  updateStatusBar() {
    uiUpdateStatusBar(this.app, this.statusBarItem, this.fileCounts);
  }

  // =========================
  // ASYNC DEBOUNCE
  // =========================

  debounceAsync<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    delay: number
  ) {
    let timer: number;
    return (...args: Parameters<T>) => {
      clearTimeout(timer);
      timer = window.setTimeout(() => fn(...args), delay);
    };
  }

  onunload() {
    console.log("Plugin Unloaded");
  }
}
