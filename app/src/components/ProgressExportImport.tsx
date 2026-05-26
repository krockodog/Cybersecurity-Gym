// @ts-nocheck
import { useState, useRef, useCallback } from 'react';
import { Download, Upload, AlertTriangle, CheckCircle, XCircle, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const APP_VERSION = '7.1';

const BACKUP_KEYS = [
  'trygit_xp',
  'trygit_streak',
  'trygit_quiz_results',
  'trygit_flashcard_states',
  'trygit_tutor_chat_cipher',
  'tutor_chat_cipher',
  'lpi1_progress',
  'trygit_weaknesses',
  'trygit_exam_target',
  'quiz_results',
  'lpi1_results',
  'lpi1_mastery',
  'trygit-pbq-history',
  'xk006_mastery',
  'xk006_answered',
  'xk006_streak',
  'xk006_celebration_seen',
];

/* ─── detect dynamic tutor chat keys ─── */
function getAllStorageKeys(): string[] {
  const dynamicKeys = Object.keys(localStorage).filter(
    (k) => k.startsWith('trygit_') || k.startsWith('tutor_') || k.startsWith('lpi1_') || k.startsWith('xk006_')
  );
  const combined = new Set([...BACKUP_KEYS, ...dynamicKeys]);
  return Array.from(combined);
}

/* ─── parse stored values for summary ─── */
function getSummary(data: Record<string, string>) {
  let quizCount = 0;
  let flashcardCount = 0;
  let chatCount = 0;

  try {
    const quizResults = data['quiz_results'];
    if (quizResults) {
      const parsed = JSON.parse(quizResults);
      quizCount += Array.isArray(parsed) ? parsed.length : 0;
    }
  } catch { /* ignore */ }

  try {
    const lpiResults = data['lpi1_results'];
    if (lpiResults) {
      const parsed = JSON.parse(lpiResults);
      quizCount += Array.isArray(parsed) ? parsed.length : 0;
    }
  } catch { /* ignore */ }

  try {
    const pbqHistory = data['trygit-pbq-history'];
    if (pbqHistory) {
      const parsed = JSON.parse(pbqHistory);
      quizCount += Array.isArray(parsed) ? parsed.length : 0;
    }
  } catch { /* ignore */ }

  try {
    const fcStates = data['trygit_flashcard_states'];
    if (fcStates) {
      const parsed = JSON.parse(fcStates);
      flashcardCount = Object.keys(parsed).length;
    }
  } catch { /* ignore */ }

  chatCount = Object.keys(data).filter(
    (k) => k.startsWith('tutor_chat_') && !k.endsWith('_cipher')
  ).length;

  if (chatCount === 0 && data['tutor_chat_cipher']) {
    chatCount = 1;
  }
  if (chatCount === 0 && data['trygit_tutor_chat_cipher']) {
    chatCount = 1;
  }

  return { quizCount, flashcardCount, chatCount };
}

/* ─── export helper ─── */
function exportProgress() {
  const keys = getAllStorageKeys();
  const data: Record<string, string> = {};
  keys.forEach((key) => {
    const value = localStorage.getItem(key);
    if (value !== null) {
      data[key] = value;
    }
  });

  const backup = {
    version: APP_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `trygit-me-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ─── validate backup structure ─── */
function validateBackup(parsed: any): { valid: boolean; error?: string } {
  if (!parsed || typeof parsed !== 'object') {
    return { valid: false, error: 'Invalid backup file format' };
  }
  if (!parsed.version || typeof parsed.version !== 'string') {
    return { valid: false, error: 'Missing version field' };
  }
  if (!parsed.data || typeof parsed.data !== 'object') {
    return { valid: false, error: 'Missing data field' };
  }
  return { valid: true };
}

export default function ProgressExportImport() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importData, setImportData] = useState<any>(null);
  const [summary, setSummary] = useState({ quizCount: 0, flashcardCount: 0, chatCount: 0 });
  const [versionWarning, setVersionWarning] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(() => {
    exportProgress();
  }, []);

  const handleImportClick = useCallback(() => {
    setImportError(null);
    setImportSuccess(false);
    setVersionWarning(null);
    setImportData(null);
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setImportError(null);
      setImportSuccess(false);
      setVersionWarning(null);

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          let parsed: any;
          try {
            parsed = JSON.parse(text);
          } catch {
            setImportError('Invalid JSON file');
            return;
          }

          const validation = validateBackup(parsed);
          if (!validation.valid) {
            setImportError(validation.error || 'Invalid backup file');
            return;
          }

          const backupVersion = parsed.version as string;
          const currentParts = APP_VERSION.split('.').map(Number);
          const backupParts = backupVersion.split('.').map(Number);

          let isNewer = false;
          for (let i = 0; i < Math.max(currentParts.length, backupParts.length); i++) {
            const c = currentParts[i] || 0;
            const b = backupParts[i] || 0;
            if (b > c) {
              isNewer = true;
              break;
            }
            if (b < c) break;
          }

          if (isNewer) {
            setVersionWarning(
              `This backup is from a newer version (${backupVersion}). Some data may not be compatible.`
            );
          }

          const sum = getSummary(parsed.data);
          setSummary(sum);
          setImportData(parsed);
          setDialogOpen(true);
        } catch {
          setImportError('Failed to read backup file');
        }
      };
      reader.onerror = () => {
        setImportError('Failed to read file');
      };
      reader.readAsText(file);

      // Reset file input so same file can be selected again
      e.target.value = '';
    },
    []
  );

  const confirmImport = useCallback(() => {
    if (!importData || !importData.data) return;

    try {
      Object.entries(importData.data as Record<string, string>).forEach(
        ([key, value]) => {
          if (value !== undefined && value !== null) {
            localStorage.setItem(key, value);
          }
        }
      );

      setDialogOpen(false);
      setImportSuccess(true);

      // Show toast-like notification and reload after delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch {
      setImportError('Failed to write data to localStorage');
    }
  }, [importData]);

  const cancelImport = useCallback(() => {
    setDialogOpen(false);
    setImportData(null);
    setVersionWarning(null);
  }, []);

  return (
    <>
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Import progress file"
        />

        <Button
          variant="outline"
          size="sm"
          onClick={handleImportClick}
          className="border-[#1a2d45] bg-[#0d1526] text-[#7da0c4] hover:bg-[#162236] hover:text-[#e0f2fe] gap-1.5 text-xs"
        >
          <Upload size={14} />
          Import
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="border-[#1a2d45] bg-[#0d1526] text-[#7da0c4] hover:bg-[#162236] hover:text-[#e0f2fe] gap-1.5 text-xs"
        >
          <Download size={14} />
          Export
        </Button>
      </div>

      {/* Inline error display */}
      {importError && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg border border-red-900/50 bg-[#1a0a0a] px-4 py-3 text-sm text-red-400 shadow-lg">
          <XCircle size={16} />
          {importError}
        </div>
      )}

      {/* Inline success display */}
      {importSuccess && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg border border-green-900/50 bg-[#0a1a0a] px-4 py-3 text-sm text-green-400 shadow-lg">
          <CheckCircle size={16} />
          Progress imported successfully! Reloading...
        </div>
      )}

      {/* Import confirmation dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-[#1a2d45] bg-[#0d1526] text-[#e0f2fe] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#e0f2fe]">
              <FileJson size={18} className="text-[#00d4ff]" />
              Import Progress
            </DialogTitle>
            <DialogDescription className="text-[#7da0c4]">
              This will overwrite your current progress. Are you sure?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {/* Version warning */}
            {versionWarning && (
              <div className="flex items-start gap-2 rounded-lg border border-yellow-900/50 bg-[#1a1500] px-3 py-2 text-xs text-yellow-400">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <span>{versionWarning}</span>
              </div>
            )}

            {/* Summary */}
            <div className="rounded-lg border border-[#1a2d45] bg-[#0a0e17] p-3">
              <p className="mb-2 text-xs font-medium text-[#7da0c4]">
                Found in backup:
              </p>
              <div className="space-y-1.5 text-sm">
                {summary.quizCount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#7da0c4]">Quiz results</span>
                    <span className="font-medium text-[#00d4ff]">
                      {summary.quizCount}
                    </span>
                  </div>
                )}
                {summary.flashcardCount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#7da0c4]">Flashcard states</span>
                    <span className="font-medium text-[#00ff41]">
                      {summary.flashcardCount}
                    </span>
                  </div>
                )}
                {summary.chatCount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#7da0c4]">Chat histories</span>
                    <span className="font-medium text-[#a855f7]">
                      {summary.chatCount}
                    </span>
                  </div>
                )}
                {summary.quizCount === 0 &&
                  summary.flashcardCount === 0 &&
                  summary.chatCount === 0 && (
                    <p className="text-xs text-[#4a6682]">
                      No countable data found (settings and progress metadata will still be imported).
                    </p>
                  )}
              </div>
            </div>

            {/* Data keys list */}
            {importData && (
              <div className="flex flex-wrap gap-1">
                {Object.keys(importData.data).map((key) => (
                  <span
                    key={key}
                    className="rounded bg-[#162236] px-1.5 py-0.5 text-[10px] text-[#4a6682]"
                  >
                    {key}
                  </span>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={cancelImport}
              className="border-red-900/50 bg-transparent text-red-400 hover:bg-red-950/30 hover:text-red-300"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={confirmImport}
              className="bg-green-600 text-white hover:bg-green-500"
            >
              <CheckCircle size={14} className="mr-1" />
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
