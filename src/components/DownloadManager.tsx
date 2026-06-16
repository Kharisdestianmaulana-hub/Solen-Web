import { useState, useEffect, useRef } from 'react';
import { Download, FolderOpen, ExternalLink, XCircle, CheckCircle2 } from 'lucide-react';
import { useBrowserStore, DownloadItem } from '../store/useBrowserStore';
import { useTranslation } from '../hooks/useTranslation';
import { openPath, revealItemInDir } from '@tauri-apps/plugin-opener';
import { motion, AnimatePresence } from 'framer-motion';

export default function DownloadManager() {
  const { downloads } = useBrowserStore();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (downloads.length === 0) return null;

  const activeDownloads = downloads.filter(d => d.status === 'downloading');
  const recentDownloads = downloads.slice(0, 6);
  
  // Calculate aggregate progress for the icon ring
  let aggregateProgress = 0;
  if (activeDownloads.length > 0) {
    const totalProgress = activeDownloads.reduce((acc, d) => acc + d.progress, 0);
    aggregateProgress = totalProgress / activeDownloads.length;
  }

  const handleOpenPath = async (path?: string) => {
    if (!path) return;
    try { await openPath(path); } catch (e) { console.error('Failed to open path', e); }
  };

  const handleReveal = async (path?: string) => {
    if (!path) return;
    try { await revealItemInDir(path); } catch (e) { console.error('Failed to reveal item', e); }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="icon-button"
        style={{
          width: '32px', height: '32px',
          borderRadius: '50%',
          border: '1.5px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative'
        }}
        title={t('downloads')}
      >
        <Download size={16} />
        {activeDownloads.length > 0 && (
          <svg style={{ position: 'absolute', top: -1.5, left: -1.5, width: 32, height: 32, pointerEvents: 'none' }}>
            <circle 
              cx="16" cy="16" r="15" 
              fill="none" 
              stroke="var(--accent-main)" 
              strokeWidth="2"
              strokeDasharray="94.2"
              strokeDashoffset={94.2 - (94.2 * aggregateProgress) / 100}
              style={{ transition: 'stroke-dashoffset 0.3s ease' }}
            />
          </svg>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            style={{
              position: 'absolute',
              top: '40px',
              right: 0,
              width: '320px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1.5px solid var(--border-main)',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '12px 16px', borderBottom: '1.5px solid var(--border-subtle)' }}>
              <h3 style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)' }}>{t('downloads')}</h3>
            </div>
            
            <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
              {recentDownloads.map(d => (
                <DownloadItemRow key={d.id} item={d} onOpen={handleOpenPath} onReveal={handleReveal} t={t} />
              ))}
            </div>

            <div style={{ padding: '8px', borderTop: '1.5px solid var(--border-subtle)' }}>
              <button 
                onClick={() => {
                  useBrowserStore.getState().setActiveView('settings');
                  setIsOpen(false);
                  // Optionally navigate to a full downloads tab if we implement one inside settings
                }}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  borderRadius: '6px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {t('seeFullHistory')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DownloadItemRow({ item, onOpen, onReveal, t }: { item: DownloadItem, onOpen: (path?: string) => void, onReveal: (path?: string) => void, t: any }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        position: 'relative'
      }}
    >
      <div style={{ 
        width: '32px', height: '32px', borderRadius: '8px', 
        backgroundColor: 'var(--bg-tertiary)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: item.status === 'error' ? '#c75c5c' : item.status === 'completed' ? '#8a9a86' : 'var(--text-muted)'
      }}>
        {item.status === 'error' ? <XCircle size={16} /> : 
         item.status === 'completed' ? <CheckCircle2 size={16} /> : 
         <Download size={16} />}
      </div>
      
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ 
          fontSize: '13px', color: 'var(--text-primary)', 
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          marginBottom: '4px'
        }}>
          {item.filename}
        </div>
        
        {item.status === 'downloading' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ height: '4px', flex: 1, backgroundColor: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${item.progress}%`, backgroundColor: 'var(--accent-main)', transition: 'width 0.2s' }} />
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.progress}%</span>
          </div>
        ) : (
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {item.status === 'error' ? t('error') || 'Error' : 
             new Date(item.createdAt).toLocaleDateString()}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isHovered && item.status === 'completed' && (
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-secondary)' }}
          >
            <button 
              onClick={() => onReveal(item.savePath)}
              className="icon-button"
              style={{ padding: '6px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              title={t('showInFolder')}
            >
              <FolderOpen size={14} />
            </button>
            <button 
              onClick={() => onOpen(item.savePath)}
              className="icon-button"
              style={{ padding: '6px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              title={t('openFile')}
            >
              <ExternalLink size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
