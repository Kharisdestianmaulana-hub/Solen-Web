import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelLeftClose, PanelLeftOpen, Plus, Sun, Moon, Settings } from 'lucide-react';
import WorkspaceSelector from './WorkspaceSelector';
import TabItem from './TabItem';
import ContextMenu from './ContextMenu';
import { useBrowserStore } from '../store/useBrowserStore';

interface SidebarProps {
  isCompact: boolean;
  toggleCompact: () => void;
}

export default function Sidebar({ isCompact, toggleCompact }: SidebarProps) {
  const { workspaces, activeWorkspaceId, tabs, activeTabIds, addTab, theme, toggleTheme, setActiveView } = useBrowserStore();
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, isOpen: boolean, tabId: string | null }>({ x: 0, y: 0, isOpen: false, tabId: null });
  const [isNewTabPressed, setIsNewTabPressed] = useState(false);

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);
  const rawTabs = tabs[activeWorkspaceId] || [];
  const currentTabs = [...rawTabs].sort((a, b) => {
    if (a.isPinned === b.isPinned) return 0;
    return a.isPinned ? -1 : 1;
  });
  const activeTabId = activeTabIds[activeWorkspaceId];

  const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, isOpen: true, tabId });
  };

  return (
    <>
      <motion.aside
        className="sidebar-container"
        initial={false}
        animate={{ width: isCompact ? 60 : 260 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        style={{
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
        }}
      >
        <div className="sidebar-header" style={{ justifyContent: isCompact ? 'center' : 'space-between' }}>
          {!isCompact && <span className="sidebar-title">Solen</span>}
          <button onClick={toggleCompact} className="icon-button" title="Toggle Sidebar (Cmd+B)">
            {isCompact ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
        </div>

        <WorkspaceSelector isCompact={isCompact} />

        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingRight: '4px' }}>
          <AnimatePresence initial={false}>
            {currentTabs.map(tab => (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, height: 0, x: -10 }}
                animate={{ opacity: 1, height: 'auto', x: 0 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                onContextMenu={(e) => handleContextMenu(e, tab.id)}
              >
                <TabItem
                  tab={tab}
                  isCompact={isCompact}
                  isActive={tab.id === activeTabId}
                  workspaceAccent={activeWorkspace?.accentColor || 'var(--border-subtle)'}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {currentTabs.length === 0 && !isCompact && (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9em', marginTop: 'var(--space-8)' }}>
              Belum ada tab terbuka
            </div>
          )}
        </div>

        {/* Bottom Actions Container */}
        <div style={{ 
          display: 'flex', 
          flexDirection: isCompact ? 'column' : 'row', 
          gap: 'var(--space-2)', 
          marginTop: 'var(--space-2)',
          alignItems: 'center'
        }}>
          <button 
            onClick={toggleTheme}
            className="icon-button"
            style={{
              width: '32px',
              height: '32px',
              flexShrink: 0,
              backgroundColor: 'var(--bg-tertiary)',
              border: '1.5px solid var(--border-subtle)',
              color: 'var(--text-primary)'
            }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button 
            onClick={() => setActiveView('settings')}
            className="icon-button"
            style={{
              width: '32px',
              height: '32px',
              flexShrink: 0,
              backgroundColor: 'var(--bg-tertiary)',
              border: '1.5px solid var(--border-subtle)',
              color: 'var(--text-primary)'
            }}
            title="Pengaturan"
          >
            <Settings size={16} />
          </button>

          <button 
            onMouseDown={() => setIsNewTabPressed(true)}
            onMouseUp={() => setIsNewTabPressed(false)}
            onMouseLeave={() => setIsNewTabPressed(false)}
            onClick={() => addTab(activeWorkspaceId || '')}
            style={{ 
              color: activeWorkspace ? 'var(--bg-primary)' : 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: isCompact ? '6px' : '8px 16px',
              borderRadius: '6px',
              backgroundColor: activeWorkspace?.accentColor || 'var(--bg-tertiary)',
              width: isCompact ? '32px' : '100%',
              height: isCompact ? '32px' : 'auto',
              justifyContent: 'center',
              flex: isCompact ? 'none' : 1,
              flexShrink: 0,
              border: '1.5px solid var(--border-main)',
              boxShadow: isNewTabPressed ? 'none' : '2px 2px 0px var(--shadow-solid)',
              transform: isNewTabPressed ? 'translate(2px, 2px)' : 'none',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.1s ease',
              margin: 0
            }}
            title="New Tab (Cmd+T)"
          >
            <Plus size={18} color={activeWorkspace ? "var(--bg-primary)" : "var(--text-primary)"} style={{ flexShrink: 0 }} />
            {!isCompact && <span>New Tab</span>}
          </button>
        </div>
      </motion.aside>

      <ContextMenu 
        x={contextMenu.x} 
        y={contextMenu.y} 
        isOpen={contextMenu.isOpen} 
        tabId={contextMenu.tabId}
        onClose={() => setContextMenu({ ...contextMenu, isOpen: false })} 
      />
    </>
  );
}
