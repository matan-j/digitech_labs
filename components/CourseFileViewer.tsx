'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface Props {
  slug: string;
  initialFiles?: string[];
}

const FOLDER_ORDER = ['', 'Research', 'Curriculum', 'Slides', 'Interactive', 'Marketing', 'QA'];
const FOLDER_LABELS: Record<string, string> = {
  '':           '📋 ראשי',
  'Research':   '🔍 מחקר',
  'Curriculum': '📚 תכנית לימודים',
  'Slides':     '🎨 מצגות',
  'Interactive':'🎮 אינטראקטיבי',
  'Marketing':  '📣 שיווק',
  'QA':         '✅ QA',
};

function fileIcon(name: string): string {
  if (name.endsWith('.html'))               return '🌐';
  if (name.match(/\.(png|jpg|jpeg|gif|svg)$/i)) return '📸';
  if (name.endsWith('.md'))                 return '📄';
  return '📃';
}

function isHtml(name: string)  { return name.endsWith('.html'); }
function isImage(name: string) { return /\.(png|jpg|jpeg|gif|svg)$/i.test(name); }

function groupFiles(files: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (const file of files) {
    const parts = file.split('/');
    const folder = parts.length > 1 ? parts[0] : '';
    if (!groups[folder]) groups[folder] = [];
    groups[folder].push(file);
  }
  return groups;
}

export default function CourseFileViewer({ slug, initialFiles = [] }: Props) {
  const [files, setFiles]           = useState<string[]>(initialFiles);
  const [selectedFile, setSelected] = useState<string | null>(null);
  const [content, setContent]       = useState<string>('');
  const [loading, setLoading]       = useState(false);
  const [viewMode, setViewMode]     = useState<'rendered' | 'raw'>('rendered');

  useEffect(() => {
    if (initialFiles.length === 0) {
      fetch(`/api/courses?slug=${encodeURIComponent(slug)}`)
        .then(r => r.json())
        .then(data => { if (data.files) setFiles(data.files); });
    }
  }, [slug, initialFiles]);

  async function openFile(file: string) {
    if (selectedFile === file) return;
    setSelected(file);
    setLoading(true);
    setContent('');
    setViewMode('rendered');
    try {
      if (isImage(file)) {
        // Images shown via /api/courses/file directly — no text content needed
        setContent('__image__');
      } else {
        const res = await fetch(`/api/courses?slug=${encodeURIComponent(slug)}&file=${encodeURIComponent(file)}`);
        const data = await res.json();
        setContent(data.content || '');
      }
    } catch {
      setContent('שגיאה בטעינת הקובץ');
    } finally {
      setLoading(false);
    }
  }

  function openInNewTab() {
    if (!selectedFile) return;
    window.open(`/api/courses/file?slug=${encodeURIComponent(slug)}&file=${encodeURIComponent(selectedFile)}`, '_blank');
  }

  const grouped      = groupFiles(files);
  const orderedFolders   = FOLDER_ORDER.filter(f => grouped[f]);
  const remainingFolders = Object.keys(grouped).filter(f => !FOLDER_ORDER.includes(f));
  const allFolders   = [...orderedFolders, ...remainingFolders];

  if (files.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">📂</p>
        <p>אין קבצים עדיין</p>
      </div>
    );
  }

  const showIframe = selectedFile && isHtml(selectedFile) && !loading;
  const showImage  = selectedFile && isImage(selectedFile) && !loading;

  return (
    <div className="flex gap-0 rounded-xl border border-gray-200 overflow-hidden" style={{ minHeight: '600px' }}>
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 bg-gray-50 border-e border-gray-200 overflow-y-auto">
        {allFolders.map(folder => (
          <div key={folder}>
            <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-100 border-b border-gray-200">
              {FOLDER_LABELS[folder] || folder}
            </div>
            {grouped[folder].map(file => {
              const name       = file.split('/').pop() || file;
              const isSelected = selectedFile === file;
              return (
                <button
                  key={file}
                  onClick={() => openFile(file)}
                  className={`w-full text-start px-3 py-2 text-sm border-b border-gray-100 transition-colors ${
                    isSelected ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="me-1.5 text-xs">{fileIcon(name)}</span>
                  {name}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {selectedFile ? (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-200 flex-shrink-0">
              <span className="text-sm font-mono text-gray-600 truncate">{selectedFile}</span>
              <div className="flex gap-1 ms-4">
                {/* Open in new tab for HTML and images */}
                {(isHtml(selectedFile) || isImage(selectedFile)) && (
                  <button
                    onClick={openInNewTab}
                    className="px-3 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 text-gray-600"
                    title="פתח בטאב חדש"
                  >
                    ↗ פתח
                  </button>
                )}
                {/* View mode toggle — only for non-HTML, non-image */}
                {!isHtml(selectedFile) && !isImage(selectedFile) && (
                  <>
                    <button
                      onClick={() => setViewMode('rendered')}
                      className={`px-3 py-1 text-xs rounded ${viewMode === 'rendered' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                      מעוצב
                    </button>
                    <button
                      onClick={() => setViewMode('raw')}
                      className={`px-3 py-1 text-xs rounded ${viewMode === 'raw' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                      Raw
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* File content */}
            {loading ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <span className="animate-spin text-2xl">⟳</span>
              </div>
            ) : showIframe ? (
              <iframe
                key={selectedFile}
                srcDoc={content}
                sandbox="allow-scripts allow-same-origin"
                className="w-full flex-1 border-0"
                title={selectedFile}
              />
            ) : showImage ? (
              <div className="flex-1 flex items-center justify-center bg-gray-50 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/courses/file?slug=${encodeURIComponent(slug)}&file=${encodeURIComponent(selectedFile)}`}
                  alt={selectedFile}
                  className="max-w-full max-h-full object-contain rounded shadow"
                />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6">
                {viewMode === 'raw' ? (
                  <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap leading-relaxed">{content}</pre>
                ) : (
                  <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-a:text-blue-600">
                    <ReactMarkdown>{content}</ReactMarkdown>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-4xl mb-3">👈</p>
              <p>בחר קובץ מהרשימה לצפייה</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
