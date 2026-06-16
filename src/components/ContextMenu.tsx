import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Pin, Move, Trash2, PinOff, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useBrowserStore } from '../store/useBrowserStore';

interface ContextMenuProps {
  x: number;
  y: number;
  isOpen: boolean;
  onClose: () => void;
  tabId: string | null;
}

export default function ContextMenu({ x, y, isOpen, onClose, tabId }: ContextMenuProps) {
  const { 
    workspaces, activeWorkspaceId, tabs, 
    duplicateTab, togglePinTab, closeTab, moveTabToWorkspace 
  } = useBrowserStore();

  const [showMoveSubmenu, setShowMoveSubmenu] = useState(false);

  useEffect(() => {
    const handleGlobalClick = () => {
      if (isOpen) onClose();
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setShowMoveSubmenu(false);
    }
  }, [isOpen]);

  if (!tabId) return null;

  const currentTabs = tabs[activeWorkspaceId] || [];
  const tab = currentTabs.find(t => t.id === tabId);
  if (!tab) return null;

  const otherWorkspaces = workspaces.filter(w => w.id !== activeWorkspaceId);
  const canMove = otherWorkspaces.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.1 }}
          style={{
            position: 'fixed',
            top: y,
            left: x,
            backgroundColor: 'var(--bg-secondary)',
            border: '1.5px solid var(--border-main)',
            boxShadow: '4px 4px 0px var(--shadow-solid)',
            borderRadius: '6px',
            padding: 'var(--space-2)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            minWidth: '180px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <MenuItem 
            icon={<Copy size={14} />} 
            label="Duplicate" 
            onClick={() => { duplicateTab(activeWorkspaceId, tabId); onClose(); }} 
          />
          <MenuItem 
            icon={tab.isPinned ? <PinOff size={14} /> : <Pin size={14} />} 
            label={tab.isPinned ? "Unpin Tab" : "Pin Tab"} 
            onClick={() => { togglePinTab(activeWorkspaceId, tabId); onClose(); }} 
          />
          
          <div style={{ position: 'relative' }}>
            <MenuItem 
              icon={<Move size={14} />} 
              label="Move to Workspace" 
              disabled={!canMove}
              onClick={() => {
                if (canMove) setShowMoveSubmenu(!showMoveSubmenu);
              }}
              rightElement={canMove ? <ChevronRight size={14} /> : undefined}
            />

            {showMoveSubmenu && canMove && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: '100%',
                marginLeft: '4px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1.5px solid var(--border-main)',
                boxShadow: '4px 4px 0px var(--shadow-solid)',
                borderRadius: '6px',
                padding: 'var(--space-2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                minWidth: '140px',
                zIndex: 101,
              }}>
                {otherWorkspaces.map(ws => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      moveTabToWorkspace(activeWorkspaceId, tabId, ws.id);
                      onClose();
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      width: '100%', padding: '6px 8px', background: 'transparent', border: 'none',
                      color: 'var(--text-primary)', cursor: 'pointer', borderRadius: '4px',
                      fontSize: '0.9em', textAlign: 'left'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: ws.accentColor, flexShrink: 0 }} />
                    {ws.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '4px 0' }} />
          <MenuItem 
            icon={<Trash2 size={14} />} 
            label="Close Tab" 
            onClick={() => { closeTab(activeWorkspaceId, tabId); onClose(); }} 
            destructive 
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MenuItem({ 
  icon, label, onClick, destructive = false, disabled = false, rightElement 
}: { 
  icon: React.ReactNode, label: string, onClick: () => void, destructive?: boolean, disabled?: boolean, rightElement?: React.ReactNode 
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '6px 8px',
        border: 'none',
        background: 'transparent',
        cursor: disabled ? 'default' : 'pointer',
        borderRadius: '4px',
        color: disabled ? 'var(--text-muted)' : (destructive ? 'var(--accent-alert)' : 'var(--text-primary)'),
        fontSize: '0.9em',
        textAlign: 'left',
        opacity: disabled ? 0.5 : 1
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)' }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.backgroundColor = 'transparent' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <span style={{ display: 'flex', alignItems: 'center', color: disabled ? 'var(--text-muted)' : (destructive ? 'var(--accent-alert)' : 'var(--text-secondary)') }}>
          {icon}
        </span>
        <span>{label}</span>
      </div>
      {rightElement && (
        <span style={{ display: 'flex', alignItems: 'center', color: disabled ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
          {rightElement}
        </span>
      )}
    </button>
  );
}
