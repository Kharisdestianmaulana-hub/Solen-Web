import { Lock, RotateCw, ArrowLeft, ArrowRight } from 'lucide-react';
import { useBrowserStore } from '../store/useBrowserStore';
import { useState, useEffect } from 'react';

export default function AddressBar() {
  const { tabs, activeWorkspaceId, activeTabIds, updateTab, navigateTab, goBack, goForward, searchEngine } = useBrowserStore();
  
  const activeTabId = activeTabIds[activeWorkspaceId];
  const activeTab = tabs[activeWorkspaceId]?.find(t => t.id === activeTabId);
  
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (activeTab) {
      setInputValue(activeTab.url);
      
      // Simulate network request finishing if it was loading
      if (activeTab.isLoading) {
        const timer = setTimeout(() => {
          updateTab(activeWorkspaceId, activeTab.id, { isLoading: false });
        }, 800);
        return () => clearTimeout(timer);
      }
    } else {
      setInputValue('');
    }
  }, [activeTab, activeWorkspaceId, updateTab]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && activeTabId) {
      let finalUrl = inputValue;
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        if (finalUrl.includes(' ') || !finalUrl.includes('.')) {
          if (searchEngine === 'duckduckgo') {
            finalUrl = `https://duckduckgo.com/?q=${encodeURIComponent(finalUrl)}`;
          } else if (searchEngine === 'bing') {
            finalUrl = `https://www.bing.com/search?q=${encodeURIComponent(finalUrl)}`;
          } else {
            finalUrl = `https://google.com/search?q=${encodeURIComponent(finalUrl)}`;
          }
        } else {
          finalUrl = `https://${finalUrl}`;
        }
      }
      navigateTab(activeWorkspaceId, activeTabId, finalUrl);
    }
  };

  const handleRefresh = () => {
    if (activeTabId) {
      updateTab(activeWorkspaceId, activeTabId, { isLoading: true });
    }
  };

  const canGoBack = activeTab ? activeTab.historyIndex > 0 : false;
  const canGoForward = activeTab ? activeTab.historyIndex < activeTab.history.length - 1 : false;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      padding: 'var(--space-2) var(--space-4)',
      backgroundColor: 'var(--bg-primary)',
      borderBottom: '2px solid var(--border-main)',
      height: '48px',
      flexShrink: 0
    }}>
      <div style={{ display: 'flex', gap: '4px' }}>
        <IconButton 
          icon={<ArrowLeft size={16} />} 
          disabled={!canGoBack} 
          onClick={() => activeTabId && goBack(activeWorkspaceId, activeTabId)} 
          title="Click to go back"
        />
        <IconButton 
          icon={<ArrowRight size={16} />} 
          disabled={!canGoForward} 
          onClick={() => activeTabId && goForward(activeWorkspaceId, activeTabId)} 
          title="Click to go forward"
        />
        <IconButton 
          icon={<RotateCw size={16} className={activeTab?.isLoading ? "animate-spin" : ""} />} 
          disabled={!activeTab || activeTab.isLoading} 
          onClick={handleRefresh} 
          title="Reload page"
        />
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '6px',
        padding: '0 var(--space-2)',
        border: '1.5px solid var(--border-main)',
        boxShadow: isFocused ? '2px 2px 0px var(--accent-media)' : 'none',
        transition: 'box-shadow 0.2s ease',
        height: '32px',
        gap: 'var(--space-2)'
      }}>
        <Lock size={14} color="var(--text-secondary)" />
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search or enter web address"
          disabled={!activeTab}
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            color: 'var(--text-primary)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '13px',
            outline: 'none'
          }}
        />
      </div>
    </div>
  );
}

function IconButton({ icon, disabled, onClick, title }: { icon: React.ReactNode, disabled?: boolean, onClick?: () => void, title?: string }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      title={title}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        borderRadius: '6px',
        border: 'none',
        background: 'transparent',
        cursor: disabled ? 'default' : 'pointer',
        color: disabled ? 'var(--text-muted)' : 'var(--text-secondary)',
        opacity: disabled ? 0.5 : 1,
        transition: 'background-color 0.2s ease'
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)' }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.backgroundColor = 'transparent' }}
    >
      {icon}
    </button>
  );
}
