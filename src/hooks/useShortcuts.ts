import { useEffect } from 'react';
import { useBrowserStore } from '../store/useBrowserStore';

interface ShortcutHandlers {
  toggleSidebar: () => void;
}

export function useShortcuts({ toggleSidebar }: ShortcutHandlers) {
  const { addTab, closeTab, activeWorkspaceId, activeTabIds, workspaces, switchWorkspace } = useBrowserStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd (Mac) or Ctrl (Windows/Linux)
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      
      if (!isCmdOrCtrl) return;

      switch (e.key.toLowerCase()) {
        case 't':
          e.preventDefault();
          addTab(activeWorkspaceId);
          break;
        case 'w':
          e.preventDefault();
          const currentTabId = activeTabIds[activeWorkspaceId];
          if (currentTabId) {
            closeTab(activeWorkspaceId, currentTabId);
          }
          break;
        case 'b':
          e.preventDefault();
          toggleSidebar();
          break;
        case 'l':
          e.preventDefault();
          // Global shortcut to focus the address bar
          const input = document.querySelector('input[placeholder="Search or enter web address"]') as HTMLInputElement;
          if (input) {
            input.focus();
            input.select();
          }
          break;
        default:
          // Check for numbers 1-9 to switch workspace
          const num = parseInt(e.key);
          if (!isNaN(num) && num > 0 && num <= workspaces.length) {
            e.preventDefault();
            switchWorkspace(workspaces[num - 1].id);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addTab, closeTab, activeWorkspaceId, activeTabIds, workspaces, switchWorkspace, toggleSidebar]);
}
