import { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import AddressBar from "./components/AddressBar";
import SettingsPage from "./components/SettingsPage";
import { useShortcuts } from "./hooks/useShortcuts";
import { useBrowserStore } from "./store/useBrowserStore";

function App() {
  const [isCompact, setIsCompact] = useState(false);
  const toggleCompact = () => setIsCompact(!isCompact);

  const { 
    activeWorkspaceId, activeTabIds, tabs, 
    renderMode, getProxyUrl, 
    navigateTab, updateTab, setContentRect, initRenderMode, searchEngine, activeView 
  } = useBrowserStore();
  
  const activeTabId = activeTabIds[activeWorkspaceId];
  const activeTab = tabs[activeWorkspaceId]?.find(t => t.id === activeTabId);
  const contentRef = useRef<HTMLDivElement>(null);

  useShortcuts({ toggleSidebar: toggleCompact });

  // Confirm render mode from Rust on mount
  useEffect(() => {
    initRenderMode();
  }, [initRenderMode]);

  // ===== Proxy Mode: listen for postMessage from iframe =====
  const handleMessage = useCallback((e: MessageEvent) => {
    if (e.data?.type === 'solen-navigate' && e.data.url && activeTabId) {
      navigateTab(activeWorkspaceId, activeTabId, e.data.url);
    }
  }, [activeWorkspaceId, activeTabId, navigateTab]);

  useEffect(() => {
    if (renderMode !== 'proxy') return;
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage, renderMode]);

  // ===== Native Mode: track content area rect =====
  const syncRect = useCallback(() => {
    if (!contentRef.current || renderMode !== 'native') return;
    const rect = contentRef.current.getBoundingClientRect();
    setContentRect({ x: rect.x, y: rect.y, width: rect.width, height: rect.height });
  }, [setContentRect, renderMode]);

  useEffect(() => {
    if (renderMode !== 'native' || !contentRef.current) return;
    
    const observer = new ResizeObserver(() => syncRect());
    observer.observe(contentRef.current);
    window.addEventListener('resize', syncRect);
    const interval = setInterval(syncRect, 500);
    syncRect();

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', syncRect);
      clearInterval(interval);
    };
  }, [syncRect, renderMode, isCompact]);

  // When iframe finishes loading
  const handleIframeLoad = () => {
    if (activeTabId) {
      updateTab(activeWorkspaceId, activeTabId, { isLoading: false });
    }
  };

  return (
    <div className="app-container">
      <Sidebar isCompact={isCompact} toggleCompact={toggleCompact} />
      
      {activeView === 'settings' ? (
        <SettingsPage />
      ) : (
        <main className="webview-panel" style={{ flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start' }}>
          <AddressBar />
          
          <div 
            ref={contentRef}
          style={{ flex: 1, position: 'relative', backgroundColor: 'var(--bg-secondary)', overflow: 'hidden' }}
        >
          {/* Proxy Mode: render iframe */}
          {renderMode === 'proxy' && activeTab && activeTab.url && (
            <iframe
              key={activeTab.url}
              src={getProxyUrl(activeTab.url)}
              onLoad={handleIframeLoad}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                backgroundColor: '#ffffff',
              }}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              title={activeTab.title}
            />
          )}
          
          {/* Native Mode: empty div, Rust renders WKWebView on top */}
          {/* (no iframe needed — the native webview overlays this area) */}

          {/* Empty Tab Placeholder */}
          {activeTab && !activeTab.url && (
            <div style={{ 
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
              backgroundColor: 'var(--bg-primary)',
              gap: '32px'
            }}>
              <h1 style={{ 
                fontSize: '64px', 
                fontWeight: 700, 
                color: 'var(--text-primary)', 
                letterSpacing: '-0.04em', 
                margin: 0,
                background: 'linear-gradient(90deg, #6B8299, #9B7EBD)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Solen
              </h1>
              
              <div style={{
                display: 'flex', alignItems: 'center',
                width: '100%', maxWidth: '560px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1.5px solid var(--border-main)',
                borderRadius: '24px',
                padding: '12px 20px',
                gap: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--text-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-main)';
              }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input 
                  type="text" 
                  placeholder={`Telusuri ${searchEngine === 'google' ? 'Google' : searchEngine === 'bing' ? 'Bing' : 'DuckDuckGo'} atau ketik URL...`}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = e.currentTarget.value;
                      if (!val) return;
                      let finalUrl = val;
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
                      navigateTab(activeWorkspaceId, activeTab.id, finalUrl);
                    }
                  }}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '15px'
                  }}
                />
              </div>
            </div>
          )}

          {/* No tab selected */}
          {!activeTab && (
            <div style={{ 
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              color: 'var(--text-muted)', fontSize: '14px',
            }}>
              Tidak ada tab yang dipilih
            </div>
          )}
        </div>
      </main>
      )}
    </div>
  );
}

export default App;
