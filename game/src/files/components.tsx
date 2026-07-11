import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Folder, FileText, Image as ImageIcon, File, ChevronLeft,
  Lock, Globe, Cat, AlertTriangle,
  HardDrive, X, Eye, BookOpen,
  StickyNote, Trash2, MapPin,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type FileEntry, type FolderData, FOLDERS, FOLDER_KEYS, STORY_CONTENT } from './data';
import Nordlicht from './pdfs/Nordlicht';
import Morgenroete from './pdfs/Morgenroete';
import FamilienNotfallplan from './pdfs/FamilienNotfallplan';
import Versicherungsliste from './pdfs/Versicherungsliste';
import Notfallkontakte from './pdfs/Notfallkontakte';
import Evakuierungsplan from './pdfs/Evakuierungsplan';
import KontoCreditus from './pdfs/KontoCreditus';
import RechtlicheBewertungHydra from './pdfs/RechtlicheBewertungHydra';
import VergabeakteHydra from './pdfs/VergabeakteHydra';
import Spendenuebergabe from './pdfs/Spendenuebergabe';
import LyraProtokoll from './pdfs/LyraProtokoll';
import { MarkdownRenderer } from './MarkdownRenderer';
import { CollectClueButton } from '../components/CollectClueButton';

const NOTES_KEY = 'files_notes';




export function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    pdf: '#EA4335',
    jpg: '#0F9D58',
    doc: '#4285F4',
    txt: '#9C27B0',
    md: '#0F9D58',
  };
  return (
    <span style={{
      fontSize: 10,
      fontWeight: 600,
      color: colors[type] || '#666',
      backgroundColor: (colors[type] || '#666') + '18',
      padding: '2px 6px',
      borderRadius: 4,
      textTransform: 'uppercase',
    }}>
      {type}
    </span>
  );
}



export function FolderList() {
  const navigate = useNavigate();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [identity, setIdentity] = useState('');
  const [denied, setDenied] = useState(false);

  const handleFolderClick = (key: string) => {
    if (key === 'vertraulich') {
      setPendingKey(key);
      setIdentity('');
      setDenied(false);
    } else {
      navigate(key);
    }
  };

  const handleConfirm = () => {
    if (identity.trim().toLowerCase() === 'daniel seidt') {
      const key = pendingKey;
      setPendingKey(null);
      setIdentity('');
      setDenied(false);
      if (key) navigate(key);
    } else {
      setDenied(true);
    }
  };

  const handleCancel = () => {
    setPendingKey(null);
    setIdentity('');
    setDenied(false);
  };

  return (
    <div style={{ padding: '16px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
        padding: '0 4px',
      }}>
        <HardDrive size={20} color="#F29900" />
        <span style={{ fontSize: 13, color: '#888' }}>
          Interner Speicher · 23,4 GB frei von 64 GB
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {FOLDER_KEYS.map(key => {
          const folder = FOLDERS[key];
          const Icon = folder.icon;
          return (
            <div
              key={key}
              onClick={() => handleFolderClick(key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 16px',
                backgroundColor: '#fff',
                borderRadius: 14,
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f5f5f5'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#fff'; }}
            >
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: folder.color + '20',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon size={24} color={folder.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 500, color: '#1C1C1E' }}>
                  {folder.name}
                </div>
                <div style={{ fontSize: 13, color: '#8E8E93', marginTop: 2 }}>
                  {folder.files.length} Dateien
                </div>
              </div>
              <ChevronLeft size={18} color="#C7C7CC" style={{ transform: 'rotate(180deg)' }} />
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {pendingKey && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.55)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: 16,
              boxSizing: 'border-box',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{
                backgroundColor: '#fff',
                borderRadius: 20,
                padding: '24px 20px',
                width: '100%',
                maxWidth: '100%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: '#EA433518',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
              }}>
                <Lock size={28} color="#EA4335" />
              </div>

              <div style={{
                fontSize: 18,
                fontWeight: 600,
                textAlign: 'center',
                color: '#1C1C1E',
                marginBottom: 6,
              }}>
                Zugriff auf vertrauliche Daten
              </div>

              <div style={{
                fontSize: 13,
                textAlign: 'center',
                color: '#666',
                lineHeight: 1.5,
                marginBottom: 18,
              }}>
                Dieser Ordner enthält sensible Dokumente. Bitte bestätige deine Identität, um fortzufahren.
              </div>

              <input
                type="text"
                value={identity}
                onChange={e => {
                  setIdentity(e.target.value);
                  setDenied(false);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleConfirm();
                }}
                placeholder="Vor- und Nachname"
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: `1.5px solid ${denied ? '#EA4335' : '#E5E5EA'}`,
                  fontSize: 15,
                  outline: 'none',
                  boxSizing: 'border-box',
                  backgroundColor: denied ? '#FFF5F5' : '#F2F2F7',
                  color: '#1C1C1E',
                  marginBottom: denied ? 6 : 16,
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              />

              {denied && (
                <div style={{
                  fontSize: 12,
                  color: '#EA4335',
                  textAlign: 'center',
                  marginBottom: 12,
                }}>
                  Identität nicht bestätigt. Zugriff verweigert.
                </div>
              )}
              {!denied && <div style={{ height: 10 }} />}

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={handleCancel}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 10,
                    border: 'none',
                    backgroundColor: '#F2F2F7',
                    color: '#1C1C1E',
                    fontSize: 15,
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleConfirm}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 10,
                    border: 'none',
                    backgroundColor: '#EA4335',
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Bestätigen
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



export function loadNotes(): Record<string, string> {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}



export function saveNote(fileName: string, note: string) {
  const all = loadNotes();
  if (note.trim()) {
    all[fileName] = note;
  } else {
    delete all[fileName];
  }
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(all));
  } catch {
    // localStorage nicht verfügbar
  }
}






export function NotesSection({ fileName, notesVersion }: { fileName: string; notesVersion: number }) {
  const [note, setNote] = useState(() => loadNotes()[fileName] || '');
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState(() => !!loadNotes()[fileName]?.trim());

  useEffect(() => {
    setNote(loadNotes()[fileName] || '');
  }, [fileName, notesVersion]);

  const handleChange = (value: string) => {
    setNote(value);
    saveNote(fileName, value);
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  const handleClear = () => {
    setNote('');
    saveNote(fileName, '');
    setOpen(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  return (
    <div style={{
      borderTop: '1px solid #E5E5EA',
      backgroundColor: '#FAFAFA',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          padding: '10px 16px',
          border: 'none',
          backgroundColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          cursor: 'pointer',
          color: '#666',
          fontSize: 12,
          fontWeight: 500,
        }}
      >
        <StickyNote size={13} color={open ? '#F29900' : '#8E8E93'} />
        <span style={{ color: open ? '#F29900' : '#666' }}>
          {open ? 'Notiz ausblenden' : (note.trim() ? 'Notiz anzeigen' : 'Notiz hinzufügen')}
        </span>
        {note.trim() && !open && (
          <span style={{
            marginLeft: 'auto',
            fontSize: 10,
            color: '#F29900',
            backgroundColor: '#F2990020',
            padding: '1px 6px',
            borderRadius: 4,
          }}>
            gespeichert
          </span>
        )}
        <ChevronLeft
          size={14}
          color="#8E8E93"
          style={{
            marginLeft: note.trim() && !open ? 6 : 'auto',
            transform: open ? 'rotate(90deg)' : 'rotate(-90deg)',
            transition: 'transform 0.2s',
          }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 16px 12px' }}>
              <textarea
                value={note}
                onChange={e => handleChange(e.target.value)}
                placeholder="Hier Notizen zu dieser Datei eintippen…"
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid #E5E5EA',
                  fontSize: 13,
                  lineHeight: 1.5,
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  backgroundColor: '#fff',
                  color: '#1C1C1E',
                  fontFamily: 'inherit',
                }}
              />
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 6,
                minHeight: 20,
              }}>
                <AnimatePresence>
                  {saved && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{ fontSize: 11, color: '#0F9D58' }}
                    >
                      ✓ gespeichert
                    </motion.span>
                  )}
                </AnimatePresence>
                {note.trim() && (
                  <button
                    onClick={handleClear}
                    style={{
                      marginLeft: 'auto',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '3px 8px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#EA4335',
                      fontSize: 11,
                      cursor: 'pointer',
                      borderRadius: 6,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FFF0F0'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <Trash2 size={11} />
                    Löschen
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



export function FilePreviewModal({
  file,
  onClose,
  folderColor = '#FBBC05',
}: {
  file: FileEntry;
  onClose: () => void;
  folderColor?: string;
}) {
  const content = STORY_CONTENT[file.name];
  const [notesVersion, setNotesVersion] = useState(0);

  const existingNote = loadNotes()[file.name];
  const hasNote = !!existingNote && existingNote.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        overflow: 'hidden',
      }}
    >
        <div style={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 2,
          display: 'flex',
          gap: 6,
        }}>

          <button
            onClick={onClose}
            style={{
              border: 'none',
              backgroundColor: 'rgba(0,0,0,0.55)',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            title="Schließen"
          >
            <X size={16} color="#fff" />
          </button>
        </div>

        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: (file.type === 'pdf' && !file.customRender) ? '20px 18px 12px' : (file.customRender ? 0 : '20px 18px'),
          fontSize: 13,
          lineHeight: 1.65,
          color: '#1C1C1E',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          whiteSpace: file.customRender ? 'normal' : 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {file.type === 'txt' && content ? (
            file.name === 'Victory.txt' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', lineHeight: 1.6 }}>{content}</div>
                <div style={{ marginTop: 10 }}>
                  <CollectClueButton clueId="files:victory" />
                </div>
              </div>
            ) : content
          ) : file.type === 'pdf' && file.customRender ? (
            file.name.includes('NORDLICHT') ? <Nordlicht /> :
            file.name.includes('MORGENRÖTE') || file.name.includes('Vorlage') ? <Morgenroete /> :
            file.name.includes('Notfallplan') ? <FamilienNotfallplan /> :
            file.name.includes('Versicherung') ? <Versicherungsliste /> :
            file.name.includes('Notfallnummern') || file.name.includes('Notfallkontakte') ? <Notfallkontakte /> :
            file.name.includes('Evakuierung') ? <Evakuierungsplan /> :
            file.name.includes('CREDITUS') ? <KontoCreditus /> :
            file.name.includes('Vergabeakte_HYDRA') ? <VergabeakteHydra /> :
            file.name.includes('HYDRA-RechtlicheBewertung') ? <RechtlicheBewertungHydra /> :
            file.name.includes('Spendenübergabe') ? <Spendenuebergabe /> :
            file.name.includes('Lyra-Protokoll') ? <LyraProtokoll /> :
            null
          ) : file.type === 'pdf' ? (
            `${file.name}

───────────────────────────────
PDF-Dokument – Datei nicht lesbar
───────────────────────────────

Diese Datei ist korrupt und konnte nicht geöffnet werden. Eine Wiederherstellung ist nicht möglich.`
          ) : file.src ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}>
              <img
                src={file.src}
                alt={file.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                  borderRadius: 8,
                  backgroundColor: '#f5f5f5',
                }}
              />
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 12,
                fontSize: 12,
                color: '#8E8E93',
                alignItems: 'center',
              }}>
                <span style={{ fontWeight: 600, color: '#1C1C1E', fontSize: 15 }}>
                  {file.name.replace(/\.[^.]+$/, '').replace(/_/g, ' ')}
                </span>
                <span>·</span>
                <span>{file.size}</span>
                <span>·</span>
                <span>{file.date}</span>
              </div>
            </div>
          ) : file.location ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                aspectRatio: '4/3',
                borderRadius: 12,
                background: `linear-gradient(135deg, ${folderColor}30 0%, ${folderColor}80 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 64,
                fontWeight: 200,
              }}>
                🐱
              </div>
              <div>
                <div style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#1C1C1E',
                  marginBottom: 4,
                }}>
                  {file.name.replace(/\.jpg$/i, '').replace(/_/g, ' ')}
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 13,
                  color: folderColor,
                  fontWeight: 500,
                  marginBottom: 12,
                }}>
                  <MapPin size={14} />
                  {file.location}
                </div>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 12,
                  fontSize: 12,
                  color: '#8E8E93',
                  marginBottom: 12,
                }}>
                  <span>Größe: {file.size}</span>
                  <span>·</span>
                  <span>Datum: {file.date}</span>
                </div>
                <div style={{ fontSize: 13, color: '#1C1C1E', lineHeight: 1.5 }}>
                  Aufgenommen in {file.location}.
                </div>
              </div>
            </div>
          ) : (
            `${file.name}

───────────────────────────────
Bild – Vorschau nicht verfügbar
───────────────────────────────

Diese Datei ist ein Bild.`
          )}
        </div>

        <NotesSection fileName={file.name} notesVersion={notesVersion} />
    </motion.div>
  );
}



export function ConfirmOpenModal({
  file,
  folderColor,
  onConfirm,
  onCancel,
}: {
  file: FileEntry;
  folderColor: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const FileIcon = file.icon;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
        boxSizing: 'border-box',
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#fff',
          borderRadius: 20,
          padding: '22px 20px',
          width: '100%',
          maxWidth: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          backgroundColor: folderColor + '18',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px',
        }}>
          <FileIcon size={26} color={folderColor} />
        </div>

        <div style={{
          fontSize: 17,
          fontWeight: 600,
          textAlign: 'center',
          color: '#1C1C1E',
          marginBottom: 6,
        }}>
          Datei öffnen?
        </div>

        <div style={{
          fontSize: 13,
          textAlign: 'center',
          color: '#666',
          lineHeight: 1.5,
          marginBottom: 18,
          wordBreak: 'break-word',
        }}>
          Möchtest du <strong>{file.name}</strong> öffnen?
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 10,
              border: 'none',
              backgroundColor: '#F2F2F7',
              color: '#1C1C1E',
              fontSize: 15,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Abbrechen
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 10,
              border: 'none',
              backgroundColor: folderColor,
              color: '#fff',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Öffnen
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}



export function CodePromptModal({
  file,
  onConfirm,
  onCancel,
}: {
  file: FileEntry;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const FileIcon = file.icon;
  const expected = file.requiresCode ?? '';

  const submit = () => {
    if (code === expected) {
      onConfirm();
    } else {
      setError(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: 16,
        boxSizing: 'border-box',
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#fff',
          borderRadius: 20,
          padding: '22px 20px',
          width: '100%',
          maxWidth: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          backgroundColor: '#EA433518',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px',
        }}>
          <Lock size={26} color="#EA4335" />
        </div>

        <div style={{
          fontSize: 17,
          fontWeight: 600,
          textAlign: 'center',
          color: '#1C1C1E',
          marginBottom: 6,
        }}>
          Geschützte Datei
        </div>

        <div style={{
          fontSize: 13,
          textAlign: 'center',
          color: '#666',
          lineHeight: 1.5,
          marginBottom: 18,
          wordBreak: 'break-word',
        }}>
          <strong>{file.name}</strong> ist mit einem Code geschützt. Tipp: welche Informationen kannst Du in Musica zu diesem Titel finden?
        </div>

        <input
          type="password"
          value={code}
          onChange={e => {
            setCode(e.target.value);
            if (error) setError(false);
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') submit();
          }}
          placeholder="Code eingeben"
          autoFocus
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: 10,
            border: `1.5px solid ${error ? '#EA4335' : '#E5E5EA'}`,
            fontSize: 18,
            letterSpacing: 4,
            textAlign: 'center',
            outline: 'none',
            boxSizing: 'border-box',
            backgroundColor: error ? '#FFF5F5' : '#F2F2F7',
            color: '#1C1C1E',
            marginBottom: error ? 6 : 16,
            transition: 'border-color 0.15s, background 0.15s',
          }}
        />

        {error && (
          <div style={{
            fontSize: 12,
            color: '#EA4335',
            textAlign: 'center',
            marginBottom: 12,
          }}>
            Falscher Code. Zugriff verweigert.
          </div>
        )}
        {!error && <div style={{ height: 10 }} />}

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 10,
              border: 'none',
              backgroundColor: '#F2F2F7',
              color: '#1C1C1E',
              fontSize: 15,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Abbrechen
          </button>
          <button
            onClick={submit}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 10,
              border: 'none',
              backgroundColor: '#EA4335',
              color: '#fff',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Öffnen
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}



export function FolderView() {
  const { folderName } = useParams();
  const navigate = useNavigate();
  const folder = folderName ? FOLDERS[folderName] : null;
  const [confirmFile, setConfirmFile] = useState<FileEntry | null>(null);
  const [codeFile, setCodeFile] = useState<FileEntry | null>(null);
  const [previewFile, setPreviewFile] = useState<FileEntry | null>(null);

  if (!folder) {
    return (
      <div style={{ padding: 16, color: '#666' }}>
        Ordner nicht gefunden.
      </div>
    );
  }

  const FolderIcon = folder.icon;

  const openFile = (file: FileEntry) => {
    if (file.requiresCode) {
      setCodeFile(file);
    } else {
      setConfirmFile(file);
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      <div
        onClick={() => navigate('..')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          marginBottom: 12,
          borderRadius: 8,
          cursor: 'pointer',
          color: folder.color,
          fontSize: 14,
          fontWeight: 500,
          marginLeft: -8,
        }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = folder.color + '10'; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
      >
        <ChevronLeft size={20} />
        Zurück
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
        padding: '0 4px',
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          backgroundColor: folder.color + '20',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <FolderIcon size={22} color={folder.color} />
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#1C1C1E' }}>
            {folder.name}
          </div>
          <div style={{ fontSize: 13, color: '#8E8E93', marginTop: 1 }}>
            {folder.files.length} Dateien
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {folder.files.map((file, i) => {
          const FileIcon = file.icon;
          const hasNote = !!loadNotes()[file.name]?.trim();
          return (
            <div
              key={i}
              onClick={() => openFile(file)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 12px',
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f5f5f5'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                backgroundColor: folder.color + '15',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <FileIcon size={20} color={folder.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: '#1C1C1E',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  <span style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>{file.name}</span>
                  {file.requiresCode && (
                    <span title="Code-geschützt" style={{ flexShrink: 0 }}>
                      <Lock size={12} color="#EA4335" />
                    </span>
                  )}
                  {hasNote && (
                    <span title="Hat Notiz" style={{ flexShrink: 0 }}>
                      <StickyNote size={13} color="#F29900" />
                    </span>
                  )}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 3,
                  flexWrap: 'wrap',
                }}>
                  <span style={{ fontSize: 12, color: '#8E8E93' }}>{file.size}</span>
                  <span style={{ fontSize: 10, color: '#C7C7CC' }}>·</span>
                  <span style={{ fontSize: 12, color: '#8E8E93' }}>{file.date}</span>
                  <span style={{ fontSize: 10, color: '#C7C7CC' }}>·</span>
                  <TypeBadge type={file.type} />
                  {file.location && (
                    <>
                      <span style={{ fontSize: 10, color: '#C7C7CC' }}>·</span>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        fontSize: 11,
                        color: '#FBBC05',
                        fontWeight: 500,
                      }}>
                        <MapPin size={10} />
                        {file.location}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <ChevronLeft size={16} color="#C7C7CC" style={{ transform: 'rotate(180deg)', flexShrink: 0 }} />
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {codeFile && (
          <CodePromptModal
            file={codeFile}
            onCancel={() => setCodeFile(null)}
            onConfirm={() => {
              const f = codeFile;
              setCodeFile(null);
              setPreviewFile(f);
            }}
          />
        )}
        {confirmFile && (
          <ConfirmOpenModal
            file={confirmFile}
            folderColor={folder.color}
            onConfirm={() => {
              setPreviewFile(confirmFile);
              setConfirmFile(null);
            }}
            onCancel={() => setConfirmFile(null)}
          />
        )}
        {previewFile && (
          <FilePreviewModal
            file={previewFile}
            onClose={() => setPreviewFile(null)}
            folderColor={folder.color}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

