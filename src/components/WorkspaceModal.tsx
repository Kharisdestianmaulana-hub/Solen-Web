import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { Workspace, useBrowserStore } from '../store/useBrowserStore';
import { useTranslation } from '../hooks/useTranslation';

const ACCENT_COLORS = [
  '#6B8299',
  '#8A9A86',
  '#DAB654',
  '#9B7EBD',
  '#C75C5C',
  '#5C9BC7',
  '#C7875C',
  '#5CC7A3',
];

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  workspace?: Workspace;
}

export default function WorkspaceModal({ isOpen, onClose, mode, workspace }: WorkspaceModalProps) {
  const { addWorkspace, editWorkspace } = useBrowserStore();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [accentColor, setAccentColor] = useState(ACCENT_COLORS[0]);
  const [homepage, setHomepage] = useState('');

  // Sync form state when opening / switching workspace
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && workspace) {
        setName(workspace.name);
        setAccentColor(workspace.accentColor);
        setHomepage(workspace.homepage ?? '');
      } else {
        setName('');
        setAccentColor(ACCENT_COLORS[0]);
        setHomepage('');
      }
    }
  }, [isOpen, mode, workspace]);

  const canSubmit = name.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;

    const payload = {
      name: name.trim(),
      accentColor,
      homepage: homepage.trim() || undefined,
    };

    if (mode === 'edit' && workspace) {
      editWorkspace(workspace.id, payload);
    } else {
      addWorkspace(payload.name, payload.accentColor, payload.homepage);
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && canSubmit) handleSubmit();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="workspace-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          onKeyDown={handleKeyDown}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.6)',
          }}
        >
          {/* Card */}
          <motion.div
            key="workspace-modal-card"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1.5px solid var(--border-main)',
              borderRadius: 12,
              padding: '28px 32px',
              width: 400,
              maxWidth: 'calc(100vw - 32px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
              }}>
                {mode === 'create' ? t('createWorkspace') : t('editWorkspace')}
              </h2>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: 4,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                <X size={18} />
              </button>
            </div>

            {/* Name field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                letterSpacing: '0.02em',
              }}>
                {t('workspaceName')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 20))}
                maxLength={20}
                placeholder={t('workspaceNamePlaceholder')}
                autoFocus
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1.5px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  borderRadius: 6,
                  padding: '8px 12px',
                  fontSize: 14,
                  outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = accentColor)}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
              />
              <span style={{
                fontSize: 11,
                color: 'var(--text-tertiary)',
                textAlign: 'right',
              }}>
                {name.length}/20
              </span>
            </div>

            {/* Color picker */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                letterSpacing: '0.02em',
              }}>
                {t('accentColor')}
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {ACCENT_COLORS.map((color) => {
                  const isSelected = color === accentColor;
                  return (
                    <button
                      key={color}
                      onClick={() => setAccentColor(color)}
                      aria-label={`Pilih warna ${color}`}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        backgroundColor: color,
                        border: isSelected ? '2.5px solid var(--text-primary)' : '2px solid transparent',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'border 0.15s, transform 0.12s',
                        transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                        boxShadow: isSelected ? `0 0 0 2px var(--bg-secondary), 0 0 0 3.5px ${color}` : 'none',
                      }}
                    >
                      {isSelected && <Check size={14} strokeWidth={3} color="#fff" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Homepage field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                letterSpacing: '0.02em',
              }}>
                {t('homepageUrl')}
              </label>
              <input
                type="url"
                value={homepage}
                onChange={(e) => setHomepage(e.target.value)}
                placeholder={t('homepagePlaceholder')}
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1.5px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  borderRadius: 6,
                  padding: '8px 12px',
                  fontSize: 14,
                  outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = accentColor)}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
              <button
                onClick={onClose}
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1.5px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  borderRadius: 8,
                  padding: '8px 18px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-primary)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                style={{
                  background: canSubmit ? accentColor : 'var(--bg-tertiary)',
                  border: '1.5px solid transparent',
                  color: canSubmit ? '#fff' : 'var(--text-tertiary)',
                  borderRadius: 8,
                  padding: '8px 22px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  transition: 'background 0.15s, opacity 0.15s',
                  opacity: canSubmit ? 1 : 0.5,
                }}
                onMouseEnter={(e) => {
                  if (canSubmit) e.currentTarget.style.opacity = '0.85';
                }}
                onMouseLeave={(e) => {
                  if (canSubmit) e.currentTarget.style.opacity = '1';
                }}
              >
                {mode === 'create' ? t('createWorkspace') : t('save')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
