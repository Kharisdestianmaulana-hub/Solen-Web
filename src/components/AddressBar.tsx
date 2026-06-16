import { Lock, RotateCw, ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';
import { useBrowserStore } from '../store/useBrowserStore';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation';

const ENGINE_LOGOS = {
  google: 'https://www.google.com/favicon.ico',
  duckduckgo: 'https://duckduckgo.com/favicon.ico',
  bing: 'https://www.bing.com/favicon.ico'
};

const ENGINE_NAMES = {
  google: 'Google',
  duckduckgo: 'DuckDuckGo',
  bing: 'Bing'
};

export default function AddressBar() {
  const { tabs, activeWorkspaceId, activeTabIds, updateTab, navigateTab, goBack, goForward, searchEngine, setSearchEngine, reloadTab } = useBrowserStore();
  const { t } = useTranslation();
  
  const activeTabId = activeTabIds[activeWorkspaceId];
  const activeTab = tabs[activeWorkspaceId]?.find(t => t.id === activeTabId);
  
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isEngineMenuOpen, setIsEngineMenuOpen] = useState(false);
  const engineMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (engineMenuRef.current && !engineMenuRef.current.contains(e.target as Node)) {
        setIsEngineMenuOpen(false);
      }
    };
    if (isEngineMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEngineMenuOpen]);

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
      let finalTitle: string | undefined = undefined;
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        if (finalUrl.includes(' ') || !finalUrl.includes('.')) {
          finalTitle = inputValue;
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
      navigateTab(activeWorkspaceId, activeTabId, finalUrl, finalTitle);
    }
  };

  const handleRefresh = () => {
    if (activeTabId) {
      reloadTab(activeWorkspaceId, activeTabId);
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
          title={t('clickToGoBack')}
        />
        <IconButton 
          icon={<ArrowRight size={16} />} 
          disabled={!canGoForward} 
          onClick={() => activeTabId && goForward(activeWorkspaceId, activeTabId)} 
          title={t('clickToGoForward')}
        />
        <IconButton 
          icon={<RotateCw size={16} className={activeTab?.isLoading ? "animate-spin" : ""} />} 
          disabled={!activeTab || activeTab.isLoading} 
          onClick={handleRefresh} 
          title={t('reloadPage')}
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
        gap: 'var(--space-2)',
        position: 'relative'
      }}>
        <Lock size={14} color="var(--text-secondary)" />
        
        <div ref={engineMenuRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <button
            onClick={() => setIsEngineMenuOpen(!isEngineMenuOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '2px 4px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
            }}
            title="Ubah Search Engine"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <img src={ENGINE_LOGOS[searchEngine]} alt={searchEngine} style={{ width: 14, height: 14 }} />
            <ChevronDown size={12} color="var(--text-secondary)" />
          </button>

          {isEngineMenuOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '8px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1.5px solid var(--border-main)',
              boxShadow: '4px 4px 0px var(--shadow-solid)',
              borderRadius: '6px',
              padding: '4px',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              minWidth: '130px',
            }}>
              {(Object.keys(ENGINE_LOGOS) as Array<keyof typeof ENGINE_LOGOS>).map((engine) => (
                <button
                  key={engine}
                  onClick={() => {
                    setSearchEngine(engine);
                    setIsEngineMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '6px 8px',
                    background: searchEngine === engine ? 'var(--bg-tertiary)' : 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    fontSize: '12px',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (searchEngine !== engine) e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                  }}
                  onMouseLeave={(e) => {
                    if (searchEngine !== engine) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <img src={ENGINE_LOGOS[engine]} alt={engine} style={{ width: 14, height: 14 }} />
                  {ENGINE_NAMES[engine]}
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          value={isFocused ? inputValue : inputValue.replace(/^https?:\/\//i, '')}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={t('searchOrEnterAddress')}
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
