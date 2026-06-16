import { useState } from 'react';
import { Settings, Palette, LayoutGrid, Shield, Info, X, Trash2, Pencil, Plus } from 'lucide-react';
import { useBrowserStore, Workspace } from '../store/useBrowserStore';
import WorkspaceModal from './WorkspaceModal';
import { motion } from 'framer-motion';

type SettingsCategory = 'general' | 'appearance' | 'workspaces' | 'privacy' | 'about';

export default function SettingsPage() {
  const { setActiveView, searchEngine, setSearchEngine, theme, toggleTheme, workspaces, deleteWorkspace, clearAllHistory } = useBrowserStore();
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('general');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | undefined>();

  const categories = [
    { id: 'general', icon: Settings, label: 'Umum' },
    { id: 'appearance', icon: Palette, label: 'Tampilan' },
    { id: 'workspaces', icon: LayoutGrid, label: 'Workspace' },
    { id: 'privacy', icon: Shield, label: 'Privasi & Keamanan' },
    { id: 'about', icon: Info, label: 'Tentang' },
  ] as const;

  const renderContent = () => {
    switch (activeCategory) {
      case 'general':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="settings-section"
          >
            <h2>Pengaturan Umum</h2>
            
            <div className="settings-group">
              <div className="settings-item">
                <div className="settings-item-text">
                  <h3>Mesin Pencari Default</h3>
                  <p>Pilih mesin pencari yang digunakan saat Anda mengetik di Address Bar.</p>
                </div>
                <div className="settings-options" style={{ display: 'flex', gap: '8px' }}>
                  {(['google', 'duckduckgo', 'bing'] as const).map(engine => (
                    <button
                      key={engine}
                      onClick={() => setSearchEngine(engine)}
                      className={`settings-btn ${searchEngine === engine ? 'active' : ''}`}
                    >
                      {engine === 'google' ? 'Google' : engine === 'bing' ? 'Bing' : 'DuckDuckGo'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'appearance':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="settings-section"
          >
            <h2>Tampilan</h2>
            <div className="settings-group">
              <div className="settings-item">
                <div className="settings-item-text">
                  <h3>Tema Aplikasi</h3>
                  <p>Pilih tema visual untuk Solen.</p>
                </div>
                <div className="settings-options" style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => theme === 'light' && toggleTheme()} 
                    className={`settings-btn ${theme === 'dark' ? 'active' : ''}`}
                  >
                    Gelap
                  </button>
                  <button 
                    onClick={() => theme === 'dark' && toggleTheme()} 
                    className={`settings-btn ${theme === 'light' ? 'active' : ''}`}
                  >
                    Terang
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'workspaces':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="settings-section"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 style={{ margin: 0 }}>Manajemen Workspace</h2>
              <button
                onClick={() => {
                  setModalMode('create');
                  setEditingWorkspace(undefined);
                  setIsModalOpen(true);
                }}
                className="settings-btn active"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Plus size={16} />
                Buat Baru
              </button>
            </div>
            
            <div className="settings-group">
              {workspaces.map(ws => (
                <div key={ws.id} className="settings-item" style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '12px', borderBottom: 'none', border: '1.5px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: ws.accentColor }} />
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', color: 'var(--text-primary)' }}>{ws.name}</h3>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{ws.homepage || 'Beranda bawaan'}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setModalMode('edit');
                        setEditingWorkspace(ws);
                        setIsModalOpen(true);
                      }}
                      className="icon-button"
                      style={{ padding: '8px', color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus workspace "${ws.name}"? Semua tab di dalamnya akan tertutup.`)) {
                          deleteWorkspace(ws.id);
                        }
                      }}
                      className="icon-button"
                      style={{ padding: '8px', color: '#c75c5c', background: 'transparent', border: 'none', cursor: 'pointer' }}
                      title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {workspaces.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  Belum ada workspace.
                </div>
              )}
            </div>
          </motion.div>
        );

      case 'privacy':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="settings-section"
          >
            <h2>Privasi & Keamanan</h2>
            <div className="settings-group">
              <div className="settings-item">
                <div className="settings-item-text">
                  <h3>Hapus Riwayat Penelusuran</h3>
                  <p>Menghapus riwayat tab yang sedang terbuka di semua workspace.</p>
                </div>
                <button
                  onClick={() => {
                    clearAllHistory();
                    alert('Riwayat penelusuran berhasil dihapus!');
                  }}
                  className="settings-btn"
                  style={{ color: '#c75c5c', borderColor: 'rgba(199, 92, 92, 0.3)' }}
                >
                  Hapus Data
                </button>
              </div>

              <div className="settings-item">
                <div className="settings-item-text">
                  <h3>Kirim permintaan "Do Not Track"</h3>
                  <p>Meminta situs web untuk tidak melacak aktivitas Anda. (Fitur placeholder)</p>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ accentColor: 'var(--accent-dev)', width: '18px', height: '18px' }} />
                </label>
              </div>
            </div>
          </motion.div>
        );

      case 'about':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="settings-section"
          >
            <h2>Tentang Solen</h2>
            <div className="settings-group">
              <div style={{ textAlign: 'center', padding: '40px 0', backgroundColor: 'var(--bg-tertiary)', borderRadius: '16px', border: '1.5px solid var(--border-subtle)' }}>
                <h1 style={{ 
                  fontSize: '48px', 
                  margin: '0 0 16px 0',
                  background: 'linear-gradient(90deg, #6B8299, #9B7EBD)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Solen
                </h1>
                <p style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 500 }}>Versi 0.1.0 (Alpha)</p>
                <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Browser masa depan berbasis agen cerdas.</p>
                
                <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
                  <button className="settings-btn active">
                    Periksa Pembaruan
                  </button>
                  <button className="settings-btn" onClick={() => window.open('https://github.com', '_blank')}>
                    GitHub
                  </button>
                </div>
              </div>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                © 2026 Solen Browser. Hak cipta dilindungi.
              </p>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div style={{
      display: 'flex',
      width: '100%',
      height: '100%',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)'
    }}>
      {/* Settings Sidebar */}
      <aside style={{
        width: '280px',
        borderRight: '1.5px solid var(--border-main)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-secondary)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', padding: '0 8px' }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Pengaturan</h1>
          <button 
            onClick={() => setActiveView('browser')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              borderRadius: '6px'
            }}
            title="Kembali"
          >
            <X size={20} />
          </button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: activeCategory === cat.id ? 'var(--bg-tertiary)' : 'transparent',
                color: activeCategory === cat.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: activeCategory === cat.id ? 600 : 500,
                transition: 'all 0.15s ease'
              }}
            >
              <cat.icon size={18} />
              {cat.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Settings Content */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        padding: '48px 64px',
        backgroundColor: 'var(--bg-primary)',
      }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          {renderContent()}
        </div>
      </main>

      <WorkspaceModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        workspace={editingWorkspace}
      />

      <style>{`
        .settings-section h2 {
          font-size: 24px;
          font-weight: 600;
          margin: 0 0 32px 0;
          color: var(--text-primary);
        }
        .settings-group {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .settings-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 24px;
          border-bottom: 1.5px solid var(--border-subtle);
        }
        .settings-item:last-child {
          border-bottom: none;
        }
        .settings-item-text h3 {
          margin: 0 0 8px 0;
          font-size: 15px;
          font-weight: 500;
          color: var(--text-primary);
        }
        .settings-item-text p {
          margin: 0;
          font-size: 13px;
          color: var(--text-muted);
        }
        .settings-btn {
          padding: 8px 16px;
          border-radius: 8px;
          border: 1.5px solid var(--border-subtle);
          background-color: transparent;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .settings-btn:hover {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
        }
        .settings-btn.active {
          border-color: var(--accent-dev);
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
