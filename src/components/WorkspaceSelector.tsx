import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Pencil } from 'lucide-react';
import { useBrowserStore, WORKSPACES_PER_PAGE, Workspace } from '../store/useBrowserStore';
import { useTranslation } from '../hooks/useTranslation';

interface WorkspaceSelectorProps {
  isCompact: boolean;
  onEditWorkspace: (ws: Workspace) => void;
}

export default function WorkspaceSelector({ isCompact, onEditWorkspace }: WorkspaceSelectorProps) {
  const {
    workspaces,
    activeWorkspaceId,
    switchWorkspace,
    deleteWorkspace,
    workspacePage,
    setWorkspacePage
  } = useBrowserStore();
  const { t } = useTranslation();

  const [pressedId, setPressedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, isOpen: boolean, workspaceId: string | null }>({ x: 0, y: 0, isOpen: false, workspaceId: null });
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(prev => ({ ...prev, isOpen: false }));
      }
    };
    if (contextMenu.isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [contextMenu.isOpen]);

  const activeWs = workspaces.find(w => w.id === activeWorkspaceId);

  const handleCycleWorkspace = () => {
    if (workspaces.length <= 1) return;
    const currentIndex = workspaces.findIndex(w => w.id === activeWorkspaceId);
    const nextWs = workspaces[(currentIndex + 1) % workspaces.length];
    switchWorkspace(nextWs.id);
  };

  const handleContextMenu = (e: React.MouseEvent, workspaceId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, isOpen: true, workspaceId });
  };

  const openEditModal = (workspace: Workspace) => {
    onEditWorkspace(workspace);
    setContextMenu(prev => ({ ...prev, isOpen: false }));
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    deleteWorkspace(id);
    setContextMenu(prev => ({ ...prev, isOpen: false }));
  };

  // Pagination logic
  const totalPages = Math.ceil(workspaces.length / WORKSPACES_PER_PAGE);
  const startIndex = workspacePage * WORKSPACES_PER_PAGE;
  const visibleWorkspaces = workspaces.slice(startIndex, startIndex + WORKSPACES_PER_PAGE);

  const hasPrevPage = workspacePage > 0;
  const hasNextPage = workspacePage < totalPages - 1;

  if (workspaces.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: isCompact ? 'center' : 'flex-start', marginBottom: 'var(--space-4)' }}>
        <button
          onClick={() => useBrowserStore.getState().addTab(activeWorkspaceId || '')}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '14px',
            backgroundColor: 'transparent',
            border: '1.5px dashed var(--border-main)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.1s ease',
          }}
          title={`${t('newTab')} (Cmd+T)`}
        >
          <Plus size={16} />
        </button>
      </div>
    );
  }

  const renderWorkspaceCircle = (ws: Workspace, isCompactView: boolean) => {
    const isActive = ws.id === activeWorkspaceId;
    const isPressed = pressedId === ws.id;
    const isHovered = hoveredId === ws.id;

    return (
      <div 
        key={ws.id} 
        style={{ position: 'relative' }}
        onMouseEnter={() => !isCompactView && setHoveredId(ws.id)}
        onMouseLeave={() => !isCompactView && setHoveredId(null)}
      >
        <button
          onMouseDown={() => setPressedId(ws.id)}
          onMouseUp={() => setPressedId(null)}
          onMouseLeave={() => setPressedId(null)}
          onClick={() => isCompactView ? handleCycleWorkspace() : switchWorkspace(ws.id)}
          onContextMenu={(e) => !isCompactView && handleContextMenu(e, ws.id)}
          title={isCompactView ? t('workspaceCycle', { name: ws.name }) : ws.name}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '14px',
            backgroundColor: ws.accentColor,
            border: '1.5px solid var(--border-main)',
            color: 'var(--bg-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
            fontWeight: 600,
            transition: 'all 0.1s ease',
            boxShadow: (isActive || isPressed) ? 'none' : '2px 2px 0px var(--shadow-solid)',
            transform: (isActive || isPressed) ? 'translate(2px, 2px)' : 'none',
            flexShrink: 0,
            fontSize: '12px'
          }}
        >
          {ws.name.charAt(0).toUpperCase()}
        </button>

        {!isCompactView && isHovered && (
          <button
            onClick={(e) => handleDelete(ws.id, e)}
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '14px',
              height: '14px',
              borderRadius: '7px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-main)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
              zIndex: 2,
            }}
            title={t('deleteWorkspace')}
          >
            <X size={10} />
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 'var(--space-2)',
        marginBottom: 'var(--space-4)',
        justifyContent: isCompact ? 'center' : 'flex-start',
        alignItems: 'center'
      }}>
        {isCompact ? (
          activeWs ? renderWorkspaceCircle(activeWs, true) : null
        ) : (
          <>
            {hasPrevPage && (
              <button 
                onClick={() => setWorkspacePage(workspacePage - 1)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
              >
                <ChevronLeft size={16} />
              </button>
            )}

            {visibleWorkspaces.map(ws => renderWorkspaceCircle(ws, false))}

            {hasNextPage && (
              <button 
                onClick={() => setWorkspacePage(workspacePage + 1)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
              >
                <ChevronRight size={16} />
              </button>
            )}

            <button
              onClick={() => useBrowserStore.getState().addTab(activeWorkspaceId || '')}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '14px',
                backgroundColor: 'transparent',
                border: '1.5px dashed var(--border-subtle)',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.1s ease',
              }}
              title={`${t('newTab')} (Cmd+T)`}
            >
              <Plus size={16} />
            </button>
          </>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu.isOpen && contextMenu.workspaceId && (
        <div 
          ref={contextMenuRef}
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-main)',
            borderRadius: '6px',
            padding: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            zIndex: 1000,
            minWidth: '120px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}
        >
          <button
            onClick={() => {
              const ws = workspaces.find(w => w.id === contextMenu.workspaceId);
              if (ws) openEditModal(ws);
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              width: '100%', padding: '6px 8px', background: 'transparent', border: 'none',
              color: 'var(--text-primary)', cursor: 'pointer', borderRadius: '4px',
              fontSize: '13px', textAlign: 'left'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Pencil size={14} /> {t('edit')}
          </button>
          <button onClick={() => handleDelete(contextMenu.workspaceId!)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--accent-alert)', width: '100%', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-primary)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
            <X size={14} />
            {t('delete')}
          </button>
        </div>
      )}
    </>
  );
}
