import React, { useState } from 'react';
import { Terminal, Copy, Check, Download, ShieldCheck } from 'lucide-react';

interface AdbToolkitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdbToolkitModal: React.FC<AdbToolkitModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const commands = [
    {
      title: 'Purgar caché global de todas las particiones (Sin Root)',
      cmd: 'adb shell pm trim-caches 999999999999999999',
      desc: 'Instruye al PackageManager de Android a vaciar todos los directorios de caché temporal de aplicaciones.',
    },
    {
      title: 'Optimización profunda de compilación ART (Speed Profile)',
      cmd: 'adb shell cmd package bg-dexopt-job',
      desc: 'Fuerza la recompilación en segundo plano de todas las aplicaciones instaladas para acelerar su apertura y reducir uso de CPU.',
    },
    {
      title: 'Forzar modo Doze e hibernación profunda inmediata',
      cmd: 'adb shell dumpsys deviceidle force-idle',
      desc: 'Congela procesos sincronizados en segundo plano inmediatamente sin esperar a que el teléfono lleve horas inactivo.',
    },
    {
      title: 'Eliminar paquetes huérfanos y registros de diagnóstico',
      cmd: 'adb shell rm -rf /sdcard/DCIM/.thumbnails/* /sdcard/Download/*.apk',
      desc: 'Borra cachés de miniaturas recreables e instaladores .apk residuales en la carpeta de descargas.',
    },
  ];

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownloadScript = () => {
    const scriptContent = `#!/bin/bash
# ==============================================================================
# DroidPulse - Script Oficial de Limpieza y Optimización Automática Android (ADB)
# ==============================================================================
echo "Iniciando secuencia de optimización en dispositivo Android conectado..."
adb wait-for-device
echo "[1/4] Limpiando caches de aplicaciones con PackageManager..."
adb shell pm trim-caches 999999999999999999
echo "[2/4] Ejecutando optimización de código ART (bg-dexopt-job)..."
adb shell cmd package bg-dexopt-job
echo "[3/4] Limpiando miniaturas residuales..."
adb shell rm -rf /sdcard/DCIM/.thumbnails/*
echo "[4/4] Aplicando perfil de ahorro energético Doze..."
adb shell dumpsys battery reset
echo "¡Optimización del sistema Android completada con éxito!"
`;
    const blob = new Blob([scriptContent], { type: 'text/x-sh' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'droidpulse_android_optimizer.sh';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl max-h-[88vh] flex flex-col">
        <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4 sm:hidden" />
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Comandos nativos ADB para Android (Sin Root)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ejecuta limpieza profunda de sistema conectando tu Android por USB o Wireless Debugging
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl transition-colors whitespace-nowrap shrink-0"
          >
            Cerrar
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {commands.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {item.title}
                </h3>
                <button
                  type="button"
                  onClick={() => handleCopy(item.cmd, idx)}
                  className="min-h-[38px] px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-emerald-500 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar comando</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2.5">{item.desc}</p>
              <code className="block w-full px-3 py-2 rounded-lg bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto">
                {item.cmd}
              </code>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Comandos oficiales de Android Open Source Project (AOSP)</span>
          </div>
          <button
            type="button"
            onClick={handleDownloadScript}
            className="min-h-[44px] px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Script .SH Automático</span>
          </button>
        </div>
      </div>
    </div>
  );
};
