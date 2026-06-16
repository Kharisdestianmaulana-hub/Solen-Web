import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

export interface Tab {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  isLoading: boolean;
  history: string[];
  historyIndex: number;
  isPinned?: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  accentColor: string;
  homepage?: string;
}

type RenderMode = 'native' | 'proxy';

export const WORKSPACES_PER_PAGE = 5;

interface BrowserState {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  tabs: Record<string, Tab[]>;
  activeTabIds: Record<string, string | null>;
  theme: 'dark' | 'light';
  renderMode: RenderMode;
  proxyPort: number;
  workspacePage: number;
  searchEngine: 'google' | 'duckduckgo' | 'bing';
  activeView: 'browser' | 'settings';

  // Content area rect for native mode
  contentRect: { x: number; y: number; width: number; height: number } | null;
  setContentRect: (rect: { x: number; y: number; width: number; height: number }) => void;

  // Actions
  initRenderMode: () => Promise<void>;
  switchWorkspace: (workspaceId: string) => void;
  addTab: (workspaceId: string, url?: string) => void;
  closeTab: (workspaceId: string, tabId: string) => void;
  setActiveTab: (workspaceId: string, tabId: string) => void;
  updateTab: (workspaceId: string, tabId: string, updates: Partial<Tab>) => void;
  toggleTheme: () => void;

  // Navigation
  navigateTab: (workspaceId: string, tabId: string, url: string) => void;
  goBack: (workspaceId: string, tabId: string) => void;
  goForward: (workspaceId: string, tabId: string) => void;

  // Proxy helper
  getProxyUrl: (url: string) => string;

  // Workspace management
  addWorkspace: (name: string, accentColor: string, homepage?: string) => void;
  editWorkspace: (id: string, updates: { name?: string; accentColor?: string; homepage?: string }) => void;
  deleteWorkspace: (id: string) => void;
  setWorkspacePage: (page: number) => void;

  // Settings
  setSearchEngine: (engine: 'google' | 'duckduckgo' | 'bing') => void;
  setActiveView: (view: 'browser' | 'settings') => void;
  clearAllHistory: () => void;

  // Context Menu Actions
  duplicateTab: (workspaceId: string, tabId: string) => void;
  togglePinTab: (workspaceId: string, tabId: string) => void;
  moveTabToWorkspace: (currentWorkspaceId: string, tabId: string, targetWorkspaceId: string) => void;
}

// Detect platform from user-agent for immediate use (before async init)
const detectMode = (): RenderMode => {
  const ua = navigator.userAgent || navigator.platform || '';
  return ua.includes('Mac') ? 'native' : 'proxy';
};

export const useBrowserStore = create<BrowserState>((set, get) => ({
  workspaces: [],
  activeWorkspaceId: '',
  tabs: {},
  activeTabIds: {},
  theme: 'dark',
  renderMode: detectMode(),
  proxyPort: 9514,
  contentRect: null,
  workspacePage: 0,
  searchEngine: 'google',
  activeView: 'browser',

  setSearchEngine: (engine) => set({ searchEngine: engine }),
  setActiveView: (view) => set({ activeView: view }),
  clearAllHistory: () => set((state) => {
    const newTabs = { ...state.tabs };
    for (const wsId in newTabs) {
      newTabs[wsId] = newTabs[wsId].map(tab => ({
        ...tab,
        history: [tab.url],
        historyIndex: 0
      }));
    }
    return { tabs: newTabs };
  }),

  initRenderMode: async () => {
    try {
      const mode = await invoke<string>('get_render_mode');
      set({ renderMode: mode as RenderMode });
    } catch {
      // Fallback to detection
    }
  },

  getProxyUrl: (url: string) => {
    const port = get().proxyPort;
    return `http://127.0.0.1:${port}/proxy?url=${encodeURIComponent(url)}`;
  },

  setContentRect: (rect) => {
    set({ contentRect: rect });
    // In native mode, resize all visible webviews
    if (get().renderMode === 'native') {
      const state = get();
      const activeTabId = state.activeTabIds[state.activeWorkspaceId];
      if (activeTabId) {
        invoke('resize_webview', { id: activeTabId, ...rect }).catch(console.error);
      }
    }
  },

  switchWorkspace: (workspaceId) => set((state) => {
    if (state.renderMode === 'native') {
      const currentTabId = state.activeTabIds[state.activeWorkspaceId];
      if (currentTabId) invoke('hide_webview', { id: currentTabId }).catch(console.error);

      const newTabId = state.activeTabIds[workspaceId];
      if (newTabId) {
        invoke('show_webview', { id: newTabId }).catch(console.error);
        if (state.contentRect) {
          invoke('resize_webview', { id: newTabId, ...state.contentRect }).catch(console.error);
        }
      }
    }
    return { activeWorkspaceId: workspaceId };
  }),

  addTab: (workspaceId, url?) => set((state) => {
    const workspace = state.workspaces.find(w => w.id === workspaceId);
    const resolvedUrl = url ?? workspace?.homepage ?? '';

    const newTab: Tab = {
      id: `t_${Date.now()}`,
      url: resolvedUrl,
      title: 'New Tab',
      isLoading: true,
      history: [resolvedUrl],
      historyIndex: 0,
      isPinned: false,
    };
    const workspaceTabs = state.tabs[workspaceId] || [];

    if (state.renderMode === 'native') {
      const currentActive = state.activeTabIds[workspaceId];
      if (currentActive) invoke('hide_webview', { id: currentActive }).catch(console.error);

      if (state.contentRect) {
        invoke('create_webview', { id: newTab.id, url: resolvedUrl, ...state.contentRect }).catch(console.error);
      }
    }

    return {
      tabs: { ...state.tabs, [workspaceId]: [...workspaceTabs, newTab] },
      activeTabIds: { ...state.activeTabIds, [workspaceId]: newTab.id },
    };
  }),

  closeTab: (workspaceId, tabId) => set((state) => {
    if (state.renderMode === 'native') {
      invoke('close_webview', { id: tabId }).catch(console.error);
    }

    const workspaceTabs = state.tabs[workspaceId] || [];
    const newTabs = workspaceTabs.filter(t => t.id !== tabId);
    let newActiveTabId = state.activeTabIds[workspaceId];

    if (newActiveTabId === tabId) {
      newActiveTabId = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null;
      if (state.renderMode === 'native' && newActiveTabId) {
        invoke('show_webview', { id: newActiveTabId }).catch(console.error);
        if (state.contentRect) {
          invoke('resize_webview', { id: newActiveTabId, ...state.contentRect }).catch(console.error);
        }
      }
    }

    return {
      tabs: { ...state.tabs, [workspaceId]: newTabs },
      activeTabIds: { ...state.activeTabIds, [workspaceId]: newActiveTabId },
    };
  }),

  setActiveTab: (workspaceId, tabId) => set((state) => {
    if (state.renderMode === 'native') {
      const currentTabId = state.activeTabIds[workspaceId];
      if (currentTabId && currentTabId !== tabId) {
        invoke('hide_webview', { id: currentTabId }).catch(console.error);
      }
      invoke('show_webview', { id: tabId }).catch(console.error);
      if (state.contentRect) {
        invoke('resize_webview', { id: tabId, ...state.contentRect }).catch(console.error);
      }
    }
    return { activeTabIds: { ...state.activeTabIds, [workspaceId]: tabId } };
  }),

  updateTab: (workspaceId, tabId, updates) => set((state) => {
    const workspaceTabs = state.tabs[workspaceId] || [];
    const newTabs = workspaceTabs.map(t => t.id === tabId ? { ...t, ...updates } : t);
    return { tabs: { ...state.tabs, [workspaceId]: newTabs } };
  }),

  toggleTheme: () => set((state) => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    return { theme: nextTheme };
  }),

  navigateTab: (workspaceId, tabId, url) => set((state) => {
    if (state.renderMode === 'native') {
      invoke('navigate_webview', { id: tabId, url }).catch(console.error);
    }
    const workspaceTabs = state.tabs[workspaceId] || [];
    const newTabs = workspaceTabs.map(t => {
      if (t.id === tabId) {
        const newHistory = t.history.slice(0, t.historyIndex + 1);
        newHistory.push(url);
        return { ...t, url, title: url, history: newHistory, historyIndex: newHistory.length - 1, isLoading: true };
      }
      return t;
    });
    return { tabs: { ...state.tabs, [workspaceId]: newTabs } };
  }),

  goBack: (workspaceId, tabId) => set((state) => {
    const workspaceTabs = state.tabs[workspaceId] || [];
    const newTabs = workspaceTabs.map(t => {
      if (t.id === tabId && t.historyIndex > 0) {
        const newIndex = t.historyIndex - 1;
        const newUrl = t.history[newIndex];
        if (state.renderMode === 'native') {
          invoke('navigate_webview', { id: tabId, url: newUrl }).catch(console.error);
        }
        return { ...t, url: newUrl, title: newUrl, historyIndex: newIndex, isLoading: true };
      }
      return t;
    });
    return { tabs: { ...state.tabs, [workspaceId]: newTabs } };
  }),

  goForward: (workspaceId, tabId) => set((state) => {
    const workspaceTabs = state.tabs[workspaceId] || [];
    const newTabs = workspaceTabs.map(t => {
      if (t.id === tabId && t.historyIndex < t.history.length - 1) {
        const newIndex = t.historyIndex + 1;
        const newUrl = t.history[newIndex];
        if (state.renderMode === 'native') {
          invoke('navigate_webview', { id: tabId, url: newUrl }).catch(console.error);
        }
        return { ...t, url: newUrl, title: newUrl, historyIndex: newIndex, isLoading: true };
      }
      return t;
    });
    return { tabs: { ...state.tabs, [workspaceId]: newTabs } };
  }),

  // Workspace management

  addWorkspace: (name, accentColor, homepage) => set((state) => {
    const id = `ws_${Date.now()}`;
    const newWorkspace: Workspace = { id, name, accentColor, homepage: homepage || '' };
    return {
      workspaces: [...state.workspaces, newWorkspace],
      tabs: { ...state.tabs, [id]: [] },
      activeTabIds: { ...state.activeTabIds, [id]: null },
      activeWorkspaceId: id,
    };
  }),

  editWorkspace: (id, updates) => set((state) => ({
    workspaces: state.workspaces.map(w => w.id === id ? { ...w, ...updates } : w),
  })),

  deleteWorkspace: (id) => set((state) => {
    const remaining = state.workspaces.filter(w => w.id !== id);

    // Clean up tabs for native mode
    if (state.renderMode === 'native') {
      const workspaceTabs = state.tabs[id] || [];
      workspaceTabs.forEach(t => invoke('close_webview', { id: t.id }).catch(console.error));
    }

    const { [id]: _removedTabs, ...restTabs } = state.tabs;
    const { [id]: _removedActive, ...restActiveTabIds } = state.activeTabIds;

    // Switch to another workspace if we just deleted the active one
    let nextActiveId = state.activeWorkspaceId;
    if (nextActiveId === id) {
      nextActiveId = remaining.length > 0 ? remaining[0].id : '';
    }

    // Adjust workspace page if needed
    const maxPage = Math.max(0, Math.ceil(remaining.length / WORKSPACES_PER_PAGE) - 1);
    const workspacePage = Math.min(state.workspacePage, maxPage);

    return {
      workspaces: remaining,
      tabs: restTabs,
      activeTabIds: restActiveTabIds,
      activeWorkspaceId: nextActiveId,
      workspacePage,
    };
  }),

  setWorkspacePage: (page) => set({ workspacePage: page }),

  // Context Menu Actions
  duplicateTab: (workspaceId, tabId) => set((state) => {
    const workspaceTabs = state.tabs[workspaceId] || [];
    const tabToDuplicate = workspaceTabs.find(t => t.id === tabId);
    if (!tabToDuplicate) return state;

    const newTab: Tab = {
      ...tabToDuplicate,
      id: `t_${Date.now()}`,
      isPinned: false, // Duplicate shouldn't necessarily be pinned
    };

    if (state.renderMode === 'native' && state.contentRect) {
      invoke('create_webview', { id: newTab.id, url: newTab.url, ...state.contentRect }).catch(console.error);
    }

    return {
      tabs: { ...state.tabs, [workspaceId]: [...workspaceTabs, newTab] },
      activeTabIds: { ...state.activeTabIds, [workspaceId]: newTab.id },
    };
  }),

  togglePinTab: (workspaceId, tabId) => set((state) => {
    const workspaceTabs = state.tabs[workspaceId] || [];
    const newTabs = workspaceTabs.map(t => t.id === tabId ? { ...t, isPinned: !t.isPinned } : t);
    return { tabs: { ...state.tabs, [workspaceId]: newTabs } };
  }),

  moveTabToWorkspace: (currentWorkspaceId, tabId, targetWorkspaceId) => set((state) => {
    if (currentWorkspaceId === targetWorkspaceId) return state;

    const currentTabs = state.tabs[currentWorkspaceId] || [];
    const tabToMove = currentTabs.find(t => t.id === tabId);
    if (!tabToMove) return state;

    // Remove from current
    const newCurrentTabs = currentTabs.filter(t => t.id !== tabId);
    let newCurrentActiveTabId = state.activeTabIds[currentWorkspaceId];
    if (newCurrentActiveTabId === tabId) {
      newCurrentActiveTabId = newCurrentTabs.length > 0 ? newCurrentTabs[newCurrentTabs.length - 1].id : null;
      if (state.renderMode === 'native' && newCurrentActiveTabId && state.activeWorkspaceId === currentWorkspaceId) {
        invoke('show_webview', { id: newCurrentActiveTabId }).catch(console.error);
        if (state.contentRect) {
          invoke('resize_webview', { id: newCurrentActiveTabId, ...state.contentRect }).catch(console.error);
        }
      }
    }

    // Hide webview if moving from active workspace
    if (state.renderMode === 'native' && state.activeWorkspaceId === currentWorkspaceId) {
      invoke('hide_webview', { id: tabId }).catch(console.error);
    }

    // Add to target
    const targetTabs = state.tabs[targetWorkspaceId] || [];
    const newTargetTabs = [...targetTabs, tabToMove];
    const newTargetActiveTabId = tabId; // Make it active in new workspace

    return {
      tabs: { 
        ...state.tabs, 
        [currentWorkspaceId]: newCurrentTabs,
        [targetWorkspaceId]: newTargetTabs
      },
      activeTabIds: { 
        ...state.activeTabIds, 
        [currentWorkspaceId]: newCurrentActiveTabId,
        [targetWorkspaceId]: newTargetActiveTabId
      },
    };
  }),
}));
