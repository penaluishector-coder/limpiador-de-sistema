import React, { useState } from 'react';
import { FolderSearch, FileWarning, Trash2, CheckSquare, Square, HardDrive, Upload } from 'lucide-react';
import { StorageItem } from '../types';

interface LocalFileScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportFiles: (items: StorageItem[]) => void;
}

export const LocalFileScannerModal: React.FC<LocalFileScannerModalProps> = ({
  isOpen,
  onClose,
  onImportFiles,
}) => {
  const [scannedFiles, setScannedFiles] = useState<StorageItem[]>([]);
  const [scanSummary, setScanSummary] = useState<{ totalFiles: number; duplicates: number; largeFiles: number } | null>(null);

  if (!isOpen) return null;

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const seenNames = new Map<string, number>();
    const results: StorageItem[] = [];
    let dupCount = 0;
    let largeCount = 0;

    Array.from(fileList).forEach((file, idx) => {
      const sizeMB = Math.max(0.1, Number((file.size / (1024 * 1024)).toFixed(2)));
      const key = `${file.name}_${file.size}`;
      const isDuplicate = seenNames.has(key) || /\(\d+\)|\bcopia\b|\bcopy\b/i.test(file.name);
      seenNames.set(key, (seenNames.get(key) || 0) + 1);

      const isApk = file.name.toLowerCase().endsWith('.apk') || file.name.toLowerCase().endsWith('.xapk');
      const isTemp = file.name.toLowerCase().endsWith('.tmp') || file.name.toLowerCase().endsWith('.log') || file.name.toLowerCase().endsWith('.bak');
      const isLarge = sizeMB >= 15;

      if (isDuplicate) dupCount++;
      if (isLarge) largeCount++;

      let type: StorageItem['type'] = 'download';
      if (isApk) type = 'apk';
      else if (isDuplicate) type = 'duplicate';
      else if (isTemp) type = 'cache';
      else if (file.type.startsWith('video/') || isLarge) type = 'video';

      results.push({
        id: `real-file-${Date.now()}-${idx}`,
        name: file.name,
        path: file.webkitRelativePath || `/Seleccionado/${file.name}`,
        sizeMB,
        type,
        date: new Date(file.lastModified).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        selected: isDuplicate || isApk || isTemp,
      });
    });

    results.sort((a, b) => b.sizeMB - a.sizeMB);
    setScannedFiles(results.slice(0, 40));
    setScanSummary({
      totalFiles: fileList.length,
      duplicates: dupCount,
      largeFiles: largeCount,
    });
  };

  const toggleSelect = (id: string) => {
    setScannedFiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleConfirm = () => {
    if (scannedFiles.length > 0) {
      onImportFiles(scannedFiles);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl max-h-[88vh] flex flex-col">
        <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4 sm:hidden" />
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Inspección de archivos reales del dispositivo
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Selecciona archivos o tu carpeta de Descargas en Android para detectar APKs obsoletos, archivos duplicados y videos pesados reales.
            </p>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl transition-colors whitespace-nowrap shrink-0"
          >
            Cerrar
          </button>
        </div>

        <div className="my-5">
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-6 cursor-pointer transition-colors bg-slate-50/60 dark:bg-slate-950/50">
            <Upload className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-2" />
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Seleccionar archivos de tu teléfono o PC para analizar
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">
              100% privado en tu navegador · Detecta .apk, copias repetidas y archivos grandes al instante
            </span>
            <input
              type="file"
              multiple
              onChange={handleFilesSelected}
              className="hidden"
            />
          </label>
        </div>

        {scanSummary && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-4 py-3 rounded-xl font-mono tabular-nums">
            <span>Archivos analizados: {scanSummary.totalFiles}</span>
            <span aria-hidden="true">·</span>
            <span>Duplicados/Copias: {scanSummary.duplicates}</span>
            <span aria-hidden="true">·</span>
            <span>Pesados (&gt;15 MB): {scanSummary.largeFiles}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 min-h-[160px]">
          {scannedFiles.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              Aún no has seleccionado archivos locales. Toca el recuadro superior para escanear archivos reales.
            </div>
          ) : (
            scannedFiles.map((file) => (
              <button
                key={file.id}
                type="button"
                onClick={() => toggleSelect(file.id)}
                className="w-full min-h-[56px] py-3 px-2 flex items-center justify-between gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {file.selected ? (
                    <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {file.type.toUpperCase()} · Modificado {file.date}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-mono tabular-nums font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0">
                  {file.sizeMB.toFixed(2)} MB
                </span>
              </button>
            ))
          )}
        </div>

        <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors whitespace-nowrap shrink-0"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={scannedFiles.length === 0}
            onClick={handleConfirm}
            className="min-h-[44px] px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 rounded-xl transition-colors whitespace-nowrap shrink-0"
          >
            Añadir al listado de limpieza ({scannedFiles.filter((f) => f.selected).length})
          </button>
        </div>
      </div>
    </div>
  );
};
