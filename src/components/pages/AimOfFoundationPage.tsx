import { useState, useEffect, useRef } from 'react';
import {
  Target, Lightbulb, Flag, FileText, CheckCircle,
  LayoutDashboard, ChevronRight, ShieldAlert, Upload,
  FileIcon, Download, Trash2, Eye, Save,
} from 'lucide-react';
import { AimOfFoundation } from '../../types';
import { getAimOfFoundation, saveAimOfFoundation, getActiveUser, isCurrentUserAdmin } from '../../database/db';

const DOCS_STORAGE_KEY = 'htwf_aim_documents_v2';

interface StoredDocument {
  id: string;
  name: string;
  size: string;
  type: string;
  dataUrl: string;      // full base64 — persists across sessions and is openable by anyone
  uploadedAt: string;
}

function loadDocs(): StoredDocument[] {
  try {
    const raw = localStorage.getItem(DOCS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDocs(docs: StoredDocument[]) {
  try {
    localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(docs));
  } catch (e) {
    console.error('Could not persist documents:', e);
  }
}

function fileIcon(type: string) {
  if (type.includes('pdf')) return '📄';
  if (type.includes('word') || type.includes('doc')) return '📝';
  if (type.includes('text')) return '📃';
  if (type.includes('sheet') || type.includes('excel')) return '📊';
  if (type.includes('presentation') || type.includes('powerpoint')) return '📊';
  if (type.includes('image')) return '🖼️';
  return '📎';
}

export default function AimOfFoundationPage() {
  const currentUser = getActiveUser();
  const isAdmin = isCurrentUserAdmin();

  const [form, setForm] = useState<AimOfFoundation>({
    mission: '',
    vision: '',
    goals: [],
    description: '',
  });
  const [autoSaved, setAutoSaved] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved form + documents on mount
  useEffect(() => {
    const data = getAimOfFoundation();
    setForm({ ...data, goals: [] });
    setDocuments(loadDocs());
  }, []);

  // Auto-save the text fields 700ms after any change (admin only)
  useEffect(() => {
    if (!isAdmin) return;
    const timer = setTimeout(() => {
      setAutoSaving(true);
      const ok = saveAimOfFoundation({ ...form, goals: [] });
      if (ok) {
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 2000);
      }
      setAutoSaving(false);
    }, 700);
    return () => clearTimeout(timer);
  }, [form, isAdmin]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Read each file as base64 DataURL and persist it immediately
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return;
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    let processed = 0;
    const next = [...documents];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const newDoc: StoredDocument = {
          id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          name: file.name,
          size: file.size < 1024
            ? `${file.size} B`
            : file.size < 1024 * 1024
            ? `${(file.size / 1024).toFixed(1)} KB`
            : `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          type: file.type || 'application/octet-stream',
          dataUrl,
          uploadedAt: new Date().toLocaleString(),
        };
        next.push(newDoc);
        processed++;
        if (processed === files.length) {
          setDocuments([...next]);
          saveDocs([...next]);
          setUploading(false);
          setAutoSaved(true);
          setTimeout(() => setAutoSaved(false), 2000);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset the file input so the same file can be re-uploaded if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openDocument = (doc: StoredDocument) => {
    // Open the file in a new browser tab directly from its base64 data URL
    const win = window.open();
    if (!win) return;
    if (doc.type.includes('pdf') || doc.type.startsWith('image') || doc.type.includes('text')) {
      // Display natively in browser
      win.document.write(
        `<html><head><title>${doc.name}</title></head>
        <body style="margin:0;background:#111;display:flex;align-items:center;justify-content:center;min-height:100vh;">
        <iframe src="${doc.dataUrl}" style="width:100vw;height:100vh;border:none;" title="${doc.name}"></iframe>
        </body></html>`
      );
    } else {
      // For Word / Excel / other formats — trigger download directly
      const a = win.document.createElement('a');
      a.href = doc.dataUrl;
      a.download = doc.name;
      a.click();
      win.close();
    }
  };

  const downloadDocument = (doc: StoredDocument) => {
    const a = document.createElement('a');
    a.href = doc.dataUrl;
    a.download = doc.name;
    a.click();
  };

  const removeDocument = (id: string) => {
    if (!isAdmin) return;
    const next = documents.filter(d => d.id !== id);
    setDocuments(next);
    saveDocs(next);
  };

  const inputClass = 'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30 outline-none transition-all duration-200 text-gray-800 dark:text-white text-sm';
  const labelClass = 'block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5';

  return (
    <div className="max-w-4xl fade-in animate-fade-in-up">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 mb-6 transition-colors">
        <LayoutDashboard className="w-4 h-4" />
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700 dark:text-gray-300 font-medium">Aim of the Foundation</span>
      </div>

      {/* Page Header */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 mb-6 transition-colors">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30">
              <Target className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Aim of the Foundation</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5 transition-colors">
                Mission, vision & documents — edits save automatically
              </p>
            </div>
          </div>

          {/* Auto-save status badge */}
          {isAdmin && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              autoSaving
                ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                : autoSaved
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700'
            }`}>
              {autoSaving ? (
                <><Save className="w-3.5 h-3.5 animate-spin-loader" style={{ animationDuration: '1.5s' }} /> Saving...</>
              ) : autoSaved ? (
                <><CheckCircle className="w-3.5 h-3.5" /> Saved</>
              ) : (
                <><Save className="w-3.5 h-3.5" /> Auto-save on</>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Read-only notice for non-admins */}
      {!isAdmin && (
        <div className="mb-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4 flex items-start gap-3 text-left">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Read-only mode</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              Only the Administrator can update this page. Current session: {currentUser?.role || 'Guest'}.
              You can still view and download all uploaded documents below.
            </p>
          </div>
        </div>
      )}

      {/* Text Fields */}
      <div className="space-y-6 mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 sm:p-8 transition-colors space-y-6">
          {/* Mission */}
          <div className="p-5 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/40 rounded-xl">
            <label className={`${labelClass} text-green-800 dark:text-green-300 flex items-center gap-2`}>
              <Lightbulb className="w-4 h-4" /> Mission Statement
            </label>
            <textarea
              name="mission"
              value={form.mission}
              onChange={handleChange}
              placeholder="What is the core mission of Heal The World Foundation?"
              rows={4}
              disabled={!isAdmin}
              className={`${inputClass} bg-white dark:bg-gray-800 border-green-200 dark:border-green-700 resize-none disabled:opacity-70 disabled:cursor-not-allowed`}
            />
          </div>

          {/* Vision */}
          <div className="p-5 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/40 rounded-xl">
            <label className={`${labelClass} text-blue-800 dark:text-blue-300 flex items-center gap-2`}>
              <Flag className="w-4 h-4" /> Vision Statement
            </label>
            <textarea
              name="vision"
              value={form.vision}
              onChange={handleChange}
              placeholder="What is your vision for the future?"
              rows={4}
              disabled={!isAdmin}
              className={`${inputClass} bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700 resize-none disabled:opacity-70 disabled:cursor-not-allowed`}
            />
          </div>

          {/* Description */}
          <div className="p-5 bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-xl">
            <label className={`${labelClass} flex items-center gap-2`}>
              <FileText className="w-4 h-4" /> Full Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Provide a detailed description of the foundation's purpose and activities..."
              rows={6}
              disabled={!isAdmin}
              className={`${inputClass} resize-none disabled:opacity-70 disabled:cursor-not-allowed`}
            />
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 sm:p-8 transition-colors">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-base">
              <Upload className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Foundation Documents
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {isAdmin
                ? 'Upload Word documents, PDFs, or text files. All files are saved permanently and accessible to everyone.'
                : `${documents.length} document${documents.length !== 1 ? 's' : ''} available — click to open or download.`}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-purple-200 dark:shadow-purple-900/30"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving file…
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload File
                </>
              )}
            </button>
          )}
        </div>

        {/* Hidden file input — supports Word, PDF, text, images */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".doc,.docx,.pdf,.txt,.rtf,.odt,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Drop zone (admin only) */}
        {isAdmin && (
          <div
            className="mb-5 rounded-2xl border-2 border-dashed border-purple-200 dark:border-purple-800/40 bg-purple-50/50 dark:bg-purple-900/5 p-6 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={(e) => {
              e.preventDefault();
              const dt = e.dataTransfer;
              if (dt.files.length > 0) {
                const syntheticEvent = { target: { files: dt.files } } as unknown as React.ChangeEvent<HTMLInputElement>;
                handleFileUpload(syntheticEvent);
              }
            }}
          >
            <Upload className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">Click or drag & drop files here</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Supports: .doc, .docx, .pdf, .txt, .rtf, .xlsx, .pptx, images</p>
          </div>
        )}

        {/* Files list */}
        {documents.length === 0 ? (
          <div className="py-10 text-center text-gray-400 dark:text-gray-500">
            <FileIcon className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p className="text-sm">No documents uploaded yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
              >
                {/* Icon */}
                <div className="text-2xl flex-shrink-0">{fileIcon(doc.type)}</div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{doc.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">
                    <span>{doc.size}</span>
                    <span>·</span>
                    <span>Uploaded {doc.uploadedAt}</span>
                  </div>
                </div>

                {/* Action Buttons — visible to everyone */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => openDocument(doc)}
                    title="Open / View"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 text-xs font-bold rounded-xl transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Open
                  </button>
                  <button
                    onClick={() => downloadDocument(doc)}
                    title="Download"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 text-xs font-bold rounded-xl transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                  {/* Delete only for admins */}
                  {isAdmin && (
                    <button
                      onClick={() => removeDocument(doc.id)}
                      title="Delete"
                      className="p-1.5 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 border border-gray-200 dark:border-gray-600 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-xl transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
