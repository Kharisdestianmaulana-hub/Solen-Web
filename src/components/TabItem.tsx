import { X, Globe, Loader2 } from 'lucide-react';
import { useBrowserStore, Tab } from '../store/useBrowserStore';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface TabItemProps {
  tab: Tab;
  isCompact: boolean;
  isActive: boolean;
  workspaceAccent: string;
}

export default function TabItem({ tab, isCompact, isActive, workspaceAccent }: TabItemProps) {
  const { setActiveTab, closeTab, activeWorkspaceId } = useBrowserStore();
  const [isHovered, setIsHovered] = useState(false);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    closeTab(activeWorkspaceId, tab.id);
  };

  return (
    <div
      onClick={() => setActiveTab(activeWorkspaceId, tab.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={tab.title}
      style={{
        height: 'var(--space-8)',
        padding: 'var(--space-1) var(--space-2)',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        cursor: 'pointer',
        backgroundColor: isActive ? 'transparent' : isHovered ? 'var(--bg-tertiary)' : 'transparent',
        borderLeft: isActive ? `4px solid ${workspaceAccent}` : '4px solid transparent',
        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
        fontWeight: isActive ? 500 : 400,
        transition: 'background-color 0.2s ease',
        marginBottom: '4px',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', flexShrink: 0 }}>
        {tab.isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          >
            <Loader2 size={16} />
          </motion.div>
        ) : tab.favicon ? (
          <img src={tab.favicon} alt="" style={{ width: 16, height: 16 }} />
        ) : (
          <Globe size={16} color="var(--text-muted)" />
        )}
      </div>

      {!isCompact && (
        <span style={{ 
          flex: 1, 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          fontSize: '0.9em'
        }}>
          {tab.title}
        </span>
      )}

      {!isCompact && (isHovered || isActive) && (
        <button
          onClick={handleClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2px',
            borderRadius: '4px',
            flexShrink: 0
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-alert)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
