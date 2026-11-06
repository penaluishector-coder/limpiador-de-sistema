import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Cpu,
  HardDrive,
  BatteryCharging,
  Thermometer,
  Trash2,
  Zap,
  ShieldCheck,
  Clock,
  ChevronRight,
  ChevronDown,
  FolderSearch,
  Terminal,
  RefreshCw,
  Check,
  Sun,
  Moon,
  Sliders,
  Play,
  AlertTriangle,
  CheckSquare,
  Square,
  Smartphone,
  Flame,
  Gauge,
} from 'lucide-react';
import {
  INITIAL_JUNK_CATEGORIES,
  INITIAL_PROCESSES,
  INITIAL_STORAGE_ITEMS,
  INITIAL_AUTO_RULES,
  INITIAL_HISTORY_LOGS,
} from './data/mockAndroidData';
import {
  JunkCategory,
  BackgroundProcess,
  StorageItem,
  AutoScheduleRule,
  OptimizationHistoryLog,
} from './types';
import { useDeviceTelemetry } from './hooks/useDeviceTelemetry';
import { LocalFileScannerModal } from './components/LocalFileScannerModal';
import { AdbToolkitModal } from './components/AdbToolkitModal';

type ActiveSection = 'dashboard' | 'cleaner' | 'booster' | 'storage' | 'automation';
type PerformanceProfile = 'Equilibrado' | 'Ultra Rendimiento' | 'Ahorro Extremo';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');

  // Core state
  const [junkCategories, setJunkCategories] = useState<JunkCategory[]>(INITIAL_JUNK_CATEGORIES);
  const [processes, setProcesses] = useState<BackgroundProcess[]>(INITIAL_PROCESSES);
  const [storageItems, setStorageItems] = useState<StorageItem[]>(INITIAL_STORAGE_ITEMS);
  const [autoRules, setAutoRules] = useState<AutoScheduleRule[]>(INITIAL_AUTO_RULES);
  const [historyLogs, setHistoryLogs] = useState<OptimizationHistoryLog[]>(INITIAL_HISTORY_LOGS);

  // Interactive UI states
  const [expandedCategory, setExpandedCategory] = useState<string | null>('app-cache');
  const [processFilter, setProcessFilter] = useState<string>('Todos');
  const [storageFilter, setStorageFilter] = useState<string>('Todos');
  const [performanceProfile, setPerformanceProfile] = useState<PerformanceProfile>('Equilibrado');
  const [autoPilotActive, setAutoPilotActive] = useState<boolean>(true);

  // Scanning & Optimization sequence state
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [optimizationStepText, setOptimizationStepText] = useState<string>('');
  const [optimizationProgress, setOptimizationProgress] = useState<number>(0);
  const [lastFeedbackBanner, setLastFeedbackBanner] = useState<string | null>(null);

  // Telemetry state
  const [cpuTempC, setCpuTempC] = useState<number>(38.4);
  const [baseStorageUsedGB, setBaseStorageUsedGB] = useState<number>(84.6);
  const totalStorageGB = 128;

  // Modals
  const [isFileScannerOpen, setIsFileScannerOpen] = useState<boolean>(false);
  const [isAdbModalOpen, setIsAdbModalOpen] = useState<boolean>(false);

  const realTelemetry = useDeviceTelemetry();

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Derived metrics
  const totalJunkMB = useMemo(() => {
    return junkCategories.reduce((acc, cat) => {
      const catSum = cat.items
        .filter((i) => i.selected)
        .reduce((s, item) => s + item.sizeMB, 0);
      return acc + catSum;
    }, 0);
  }, [junkCategories]);

  const totalProcessRamMB = useMemo(() => {
    return processes.reduce((acc, proc) => acc + proc.ramMB, 0);
  }, [processes]);

  const selectedProcessRamMB = useMemo(() => {
    return processes
      .filter((p) => p.selected)
      .reduce((acc, proc) => acc + proc.ramMB, 0);
  }, [processes]);

  const totalRamGB = realTelemetry.deviceMemoryGB || 8;
  const systemBaseRamMB = 2450;
  const currentUsedRamMB = systemBaseRamMB + totalProcessRamMB;
  const ramUsagePercent = Math.min(
    96,
    Math.round((currentUsedRamMB / (totalRamGB * 1024)) * 100)
  );

  const selectedStorageMB = useMemo(() => {
    return storageItems
      .filter((s) => s.selected)
      .reduce((acc, item) => acc + item.sizeMB, 0);
  }, [storageItems]);

  const totalRecoverableMB = totalJunkMB + selectedProcessRamMB + selectedStorageMB;

  // Calculate dynamic system health index (0-100) based on real current junk, RAM, and thermal state
  const healthPercentage = useMemo(() => {
    let score = 98;
    if (totalJunkMB > 2000) score -= 16;
    else if (totalJunkMB > 500) score -= 8;
    else if (totalJunkMB > 0) score -= 3;

    if (ramUsagePercent > 75) score -= 12;
    else if (ramUsagePercent > 60) score -= 6;

    if (cpuTempC > 40) score -= 8;
    else if (cpuTempC > 36) score -= 3;

    return Math.max(42, Math.min(100, score));
  }, [totalJunkMB, ramUsagePercent, cpuTempC]);

  // One-Tap Full System Auto-Optimize
  const runSmartAutoOptimization = () => {
    if (isOptimizing) return;
    setIsOptimizing(true);
    setOptimizationProgress(12);
    setOptimizationStepText('Escaneando particiones de caché y paquetes APK residuales...');

    setTimeout(() => {
      setOptimizationProgress(42);
      setOptimizationStepText('Purgando caché temporal de aplicaciones y registros huérfanos...');
    }, 450);

    setTimeout(() => {
      setOptimizationProgress(74);
      setOptimizationStepText('Hibernando procesos de alto consumo en segundo plano...');
    }, 900);

    setTimeout(() => {
      const cleanedJunk = totalJunkMB;
      const freedRam = selectedProcessRamMB;
      const cleanedStorage = selectedStorageMB;
      const totalDiskFreed = cleanedJunk + cleanedStorage;

      // Clear selected junk items
      setJunkCategories((prev) =>
        prev.map((cat) => {
          const remainingItems = cat.items.filter((item) => !item.selected);
          const newSize = remainingItems.reduce((s, i) => s + i.sizeMB, 0);
          return {
            ...cat,
            sizeMB: newSize,
            items: remainingItems,
          };
        })
      );

      // Hibernate selected processes
      setProcesses((prev) => prev.filter((p) => !p.selected));

      // Remove selected storage items
      setStorageItems((prev) => prev.filter((s) => !s.selected));

      // Cool down CPU and reduce storage used
      const tempDrop = Number((Math.random() * 2.4 + 1.8).toFixed(1));
      setCpuTempC((prev) => Math.max(31.2, Number((prev - tempDrop).toFixed(1))));
      setBaseStorageUsedGB((prev) =>
        Math.max(40, Number((prev - totalDiskFreed / 1024).toFixed(2)))
      );

      // Clear browser cache if available
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        }).catch(() => {});
      }

      // Add log entry
      const newLog: OptimizationHistoryLog = {
        id: `log-${Date.now()}`,
        timestamp: 'Ahora mismo',
        action: 'Optimización inteligente 1-Toque ejecutada',
        freedMB: Math.round(totalDiskFreed),
        ramFreedMB: Math.round(freedRam),
        tempDropC: tempDrop,
        mode: autoPilotActive ? 'Automático' : 'Manual',
      };
      setHistoryLogs((prev) => [newLog, ...prev]);

      setOptimizationProgress(100);
      setOptimizationStepText('Sistema Android optimizado al máximo rendimiento');

      setTimeout(() => {
        setIsOptimizing(false);
        setOptimizationProgress(0);
        setLastFeedbackBanner(
          `Se liberaron ${(totalDiskFreed / 1024).toFixed(2)} GB de almacenamiento y ${freedRam} MB de RAM. Temperatura reducida en -${tempDrop} °C.`
        );
      }, 400);
    }, 1350);
  };

  // Clean only Junk Categories
  const handleCleanSelectedJunk = () => {
    if (totalJunkMB === 0) return;
    const cleaned = totalJunkMB;
    setJunkCategories((prev) =>
      prev.map((cat) => {
        const remaining = cat.items.filter((i) => !i.selected);
        return {
          ...cat,
          sizeMB: remaining.reduce((s, i) => s + i.sizeMB, 0),
          items: remaining,
        };
      })
    );
    setBaseStorageUsedGB((prev) => Math.max(40, Number((prev - cleaned / 1024).toFixed(2))));
    setHistoryLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: 'Ahora mismo',
        action: 'Purga de archivos basura y caché de apps',
        freedMB: Math.round(cleaned),
        ramFreedMB: 0,
        tempDropC: 0.6,
        mode: 'Manual',
      },
      ...prev,
    ]);
    setLastFeedbackBanner(`Limpieza completada: ${cleaned} MB de caché y residuos eliminados.`);
  };

  // Boost only RAM Processes
  const handleHibernateSelectedProcesses = () => {
    if (selectedProcessRamMB === 0) return;
    const freed = selectedProcessRamMB;
    setProcesses((prev) => prev.filter((p) => !p.selected));
    setCpuTempC((prev) => Math.max(31.0, Number((prev - 2.3).toFixed(1))));
    setHistoryLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: 'Ahora mismo',
        action: 'Hibernación de procesos en segundo plano y enfriamiento CPU',
        freedMB: 0,
        ramFreedMB: Math.round(freed),
        tempDropC: 2.3,
        mode: 'Manual',
      },
      ...prev,
    ]);
    setLastFeedbackBanner(`Se hibernaron las apps seleccionadas liberando ${freed} MB de memoria RAM.`);
  };

  // Delete selected large/duplicate storage files
  const handleCleanStorageItems = () => {
    if (selectedStorageMB === 0) return;
    const freed = selectedStorageMB;
    setStorageItems((prev) => prev.filter((s) => !s.selected));
    setBaseStorageUsedGB((prev) => Math.max(40, Number((prev - freed / 1024).toFixed(2))));
    setLastFeedbackBanner(`Se eliminaron archivos pesados/duplicados liberando ${freed.toFixed(1)} MB.`);
  };

  // Reset scan to simulate a fresh deep device audit
  const handleRescanDevice = () => {
    setJunkCategories(INITIAL_JUNK_CATEGORIES);
    setProcesses(INITIAL_PROCESSES);
    setStorageItems(INITIAL_STORAGE_ITEMS);
    setCpuTempC(38.9);
    setBaseStorageUsedGB(84.6);
    setLastFeedbackBanner('Análisis profundo del sistema completado: nuevos residuos detectados.');
  };

  const toggleJunkItem = (catId: string, itemId: string) => {
    setJunkCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== catId) return cat;
        const updatedItems = cat.items.map((item) =>
          item.id === itemId ? { ...item, selected: !item.selected } : item
        );
        return {
          ...cat,
          items: updatedItems,
          selected: updatedItems.some((i) => i.selected),
        };
      })
    );
  };

  const toggleJunkCategoryAll = (catId: string) => {
    setJunkCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== catId) return cat;
        const nextState = !cat.items.every((i) => i.selected);
        return {
          ...cat,
          selected: nextState,
          items: cat.items.map((i) => ({ ...i, selected: nextState })),
        };
      })
    );
  };

  const toggleProcessSelection = (id: string) => {
    setProcesses((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p))
    );
  };

  const toggleStorageSelection = (id: string) => {
    setStorageItems((prev) =>
      prev.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s))
    );
  };

  const toggleAutoRule = (id: string) => {
    setAutoRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleImportRealFiles = (imported: StorageItem[]) => {
    setStorageItems((prev) => [...imported, ...prev]);
    setActiveSection('storage');
    setLastFeedbackBanner(
      `Se importaron ${imported.length} archivos reales de tu dispositivo para revisión.`
    );
  };

  const filteredProcesses = useMemo(() => {
    if (processFilter === 'Todos') return processes;
    return processes.filter((p) => p.category === processFilter);
  }, [processes, processFilter]);

  const filteredStorageItems = useMemo(() => {
    if (storageFilter === 'Todos') return storageItems;
    return storageItems.filter((s) => s.type === storageFilter);
  }, [storageItems, storageFilter]);

  // SVG Ring calculation
  const ringRadius = 64;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringStrokeDashoffset =
    ringCircumference - (healthPercentage / 100) * ringCircumference;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-24 lg:pb-12 transition-colors">
      {/* Top Bar Contract: Zone 1 (Brand) — Zone 2 (4-5 Nav Links) — Zone 3 (1 Primary Action) */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-4 sm:px-8 h-14 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveSection('dashboard');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0 font-display"
        >
          DroidPulse
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
          <button
            type="button"
            onClick={() => setActiveSection('dashboard')}
            className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeSection === 'dashboard'
                ? 'border-emerald-500 text-slate-900 dark:text-slate-100'
                : 'border-transparent'
            }`}
          >
            Panel General
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('cleaner')}
            className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeSection === 'cleaner'
                ? 'border-emerald-500 text-slate-900 dark:text-slate-100'
                : 'border-transparent'
            }`}
          >
            Limpiador Basura
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('booster')}
            className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeSection === 'booster'
                ? 'border-emerald-500 text-slate-900 dark:text-slate-100'
                : 'border-transparent'
            }`}
          >
            Acelerador RAM
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('storage')}
            className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeSection === 'storage'
                ? 'border-emerald-500 text-slate-900 dark:text-slate-100'
                : 'border-transparent'
            }`}
          >
            Almacenamiento
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('automation')}
            className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeSection === 'automation'
                ? 'border-emerald-500 text-slate-900 dark:text-slate-100'
                : 'border-transparent'
            }`}
          >
            Piloto Automático
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={runSmartAutoOptimization}
            disabled={isOptimizing}
            className="min-h-[40px] px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            {isOptimizing ? 'Optimizando...' : 'Optimizar Ahora'}
          </button>
        </div>
      </header>

      {/* Main Responsive Container (Mobile-first expanding cleanly to 1280px 12-col layout on desktop) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Sub-header Workspace Toolbar (Device Telemetry + Theme & Tools) */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-medium text-slate-900 dark:text-slate-200">
              {realTelemetry.userAgentModel}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{realTelemetry.cpuCores} núcleos CPU</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{totalRamGB} GB RAM</span>
            {realTelemetry.batteryLevel !== null && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  Batería {realTelemetry.batteryLevel}%{' '}
                  {realTelemetry.batteryCharging ? '(Cargando)' : ''}
                </span>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFileScannerOpen(true)}
              className="min-h-[40px] px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 rounded-xl flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              <FolderSearch className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Escanear Archivos Reales</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAdbModalOpen(true)}
              className="min-h-[40px] px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 rounded-xl flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              <Terminal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Comandos ADB</span>
            </button>
            <button
              type="button"
              onClick={handleRescanDevice}
              className="min-h-[40px] px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 rounded-xl flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
              title="Re-escanear sistema"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-analizar</span>
            </button>
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="min-h-[40px] min-w-[40px] p-2 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 rounded-xl flex items-center justify-center transition-colors shrink-0"
              aria-label="Cambiar tema claro u oscuro"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Notification Banner on Completed Action */}
        {lastFeedbackBanner && (
          <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-sm">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{lastFeedbackBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setLastFeedbackBanner(null)}
              className="text-xs font-medium underline hover:no-underline whitespace-nowrap shrink-0"
            >
              Ocultar
            </button>
          </div>
        )}

        {/* Primary Focal Anchor: System Optimization Cockpit + 4 Core Telemetry Cards */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left 7 Cols: Interactive Optimization Ring & 1-Tap Automated Engine */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* SVG Progress Ring */}
              <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 148 148">
                  <circle
                    cx="74"
                    cy="74"
                    r={ringRadius}
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-slate-100 dark:text-slate-800"
                  />
                  <circle
                    cx="74"
                    cy="74"
                    r={ringRadius}
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringStrokeDashoffset}
                    strokeLinecap="round"
                    className={`transition-all duration-500 ${
                      healthPercentage >= 85
                        ? 'text-emerald-500'
                        : healthPercentage >= 70
                        ? 'text-amber-500'
                        : 'text-rose-500'
                    }`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                    {healthPercentage}%
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Estado Android
                  </span>
                </div>
              </div>

              {/* Action & Diagnosis Details */}
              <div className="flex-1 text-center sm:text-left">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span>Diagnóstico en tiempo real</span>
                  <span aria-hidden="true"> · </span>
                  <span>
                    {autoPilotActive ? 'Piloto Automático Activo' : 'Modo Manual'}
                  </span>
                </div>
                <h1
                  className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight"
                  style={{ textWrap: 'balance' }}
                >
                  {totalRecoverableMB > 250
                    ? `${(totalRecoverableMB / 1024).toFixed(2)} GB listos para liberar automáticamente`
                    : 'Rendimiento del sistema limpio y estabilizado'}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  {totalRecoverableMB > 250
                    ? `Se detectaron ${totalJunkMB} MB en cachés residuales, ${selectedStorageMB} MB en archivos repetidos y ${selectedProcessRamMB} MB de RAM ocupada por procesos inactivos.`
                    : 'Todas las particiones de caché temporal están limpias y los procesos en segundo plano operan dentro de los márgenes térmicos óptimos.'}
                </p>

                {/* Active Optimization Progress Bar */}
                {isOptimizing && (
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                      <span>{optimizationStepText}</span>
                      <span>{optimizationProgress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${optimizationProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={runSmartAutoOptimization}
                  disabled={isOptimizing}
                  className="min-h-[48px] px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-semibold text-sm flex items-center gap-2.5 shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>
                    {isOptimizing
                      ? 'Ejecutando limpieza...'
                      : totalRecoverableMB > 0
                      ? `Limpiar y Optimizar (${(totalRecoverableMB / 1024).toFixed(2)} GB)`
                      : 'Ejecutar Mantenimiento Preventivo'}
                  </span>
                </button>
              </div>

              {/* Performance Profile Segmented Control */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl">
                {(
                  ['Equilibrado', 'Ultra Rendimiento', 'Ahorro Extremo'] as PerformanceProfile[]
                ).map((profile) => (
                  <button
                    key={profile}
                    type="button"
                    onClick={() => {
                      setPerformanceProfile(profile);
                      if (profile === 'Ultra Rendimiento') {
                        setLastFeedbackBanner(
                          'Perfil Ultra Rendimiento activado: prioridad de CPU para primer plano y frecuencia táctil máxima.'
                        );
                      } else if (profile === 'Ahorro Extremo') {
                        setCpuTempC((prev) => Math.max(30.5, Number((prev - 1.2).toFixed(1))));
                        setLastFeedbackBanner(
                          'Perfil Ahorro Extremo activado: sincronización de fondo restringida y modo Doze agresivo.'
                        );
                      }
                    }}
                    className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                      performanceProfile === profile
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {profile}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right 5 Cols: 2x2 Hardware Telemetry Cards */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            {/* Storage Card */}
            <button
              type="button"
              onClick={() => setActiveSection('storage')}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 rounded-2xl p-5 text-left flex flex-col justify-between transition-colors"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-medium">Almacenamiento</span>
                <HardDrive className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="my-3">
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                  {baseStorageUsedGB} <span className="text-sm font-normal text-slate-500">/ {totalStorageGB} GB</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {Math.round((baseStorageUsedGB / totalStorageGB) * 100)}% ocupado ·{' '}
                  {(totalStorageGB - baseStorageUsedGB).toFixed(1)} GB libres
                </p>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${Math.min(100, (baseStorageUsedGB / totalStorageGB) * 100)}%` }}
                />
              </div>
            </button>

            {/* RAM Card */}
            <button
              type="button"
              onClick={() => setActiveSection('booster')}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 rounded-2xl p-5 text-left flex flex-col justify-between transition-colors"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-medium">Memoria RAM</span>
                <Cpu className="w-4 h-4 text-sky-500" />
              </div>
              <div className="my-3">
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                  {ramUsagePercent}% <span className="text-sm font-normal text-slate-500">({(currentUsedRamMB / 1024).toFixed(1)} GB)</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {processes.length} procesos activos en fondo
                </p>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full ${
                    ramUsagePercent > 75 ? 'bg-amber-500' : 'bg-sky-500'
                  }`}
                  style={{ width: `${ramUsagePercent}%` }}
                />
              </div>
            </button>

            {/* Thermal CPU Card */}
            <button
              type="button"
              onClick={() => setActiveSection('booster')}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 rounded-2xl p-5 text-left flex flex-col justify-between transition-colors"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-medium">Temperatura CPU</span>
                <Thermometer
                  className={`w-4 h-4 ${
                    cpuTempC > 38 ? 'text-amber-500' : 'text-emerald-500'
                  }`}
                />
              </div>
              <div className="my-3">
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                  {cpuTempC} °C
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {cpuTempC > 38
                    ? 'Disipación recomendada'
                    : 'Temperatura térmica óptima'}
                </p>
              </div>
              <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Enfriador rápido disponible →
              </div>
            </button>

            {/* Junk & Residual Card */}
            <button
              type="button"
              onClick={() => setActiveSection('cleaner')}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 rounded-2xl p-5 text-left flex flex-col justify-between transition-colors"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-medium">Basura y Caché</span>
                <Trash2 className="w-4 h-4 text-amber-500" />
              </div>
              <div className="my-3">
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                  {totalJunkMB >= 1024
                    ? `${(totalJunkMB / 1024).toFixed(2)} GB`
                    : `${totalJunkMB} MB`}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {junkCategories.reduce((acc, c) => acc + c.items.length, 0)} paquetes residuales
                </p>
              </div>
              <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Revisar detalles de caché →
              </div>
            </button>
          </div>
        </section>

        {/* Main Workspace Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left/Main 8 Columns: Active Tool Workspace */}
          <div className="lg:col-span-8 space-y-6">
            {/* MODULE 1: DEEP JUNK CLEANER */}
            {(activeSection === 'dashboard' || activeSection === 'cleaner') && (
              <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      01. Limpiador profundo de caché y residuos
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Elimina archivos temporales sin borrar tus fotos personales ni conversaciones
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCleanSelectedJunk}
                    disabled={totalJunkMB === 0}
                    className="min-h-[44px] px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 disabled:opacity-40 rounded-xl transition-colors whitespace-nowrap shrink-0"
                  >
                    Limpiar Seleccionados ({totalJunkMB} MB)
                  </button>
                </div>

                {junkCategories.every((c) => c.items.length === 0) ? (
                  <div className="py-10 text-center space-y-3">
                    <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Caché y directorios residuales 100% limpios
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                      No se encontraron archivos temporales ni paquetes APK obsoletos pendientes de purga.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
                    {junkCategories.map((cat) => {
                      const isExpanded = expandedCategory === cat.id;
                      const selectedCatMB = cat.items
                        .filter((i) => i.selected)
                        .reduce((s, i) => s + i.sizeMB, 0);

                      if (cat.items.length === 0) return null;

                      return (
                        <div key={cat.id} className="py-3">
                          <div className="flex items-center justify-between gap-3 min-h-[52px]">
                            <div className="flex items-center gap-3 min-w-0">
                              <button
                                type="button"
                                onClick={() => toggleJunkCategoryAll(cat.id)}
                                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-emerald-600 dark:text-emerald-400"
                                aria-label={`Seleccionar categoría ${cat.name}`}
                              >
                                {cat.items.every((i) => i.selected) ? (
                                  <CheckSquare className="w-5 h-5" />
                                ) : (
                                  <Square className="w-5 h-5 text-slate-400" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedCategory(isExpanded ? null : cat.id)
                                }
                                className="text-left min-w-0 flex-1"
                              >
                                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                                  {cat.name}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                  {cat.description}
                                </div>
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setExpandedCategory(isExpanded ? null : cat.id)
                              }
                              className="flex items-center gap-2 min-h-[44px] px-2 text-sm font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0"
                            >
                              <span>{selectedCatMB} MB</span>
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                          </div>

                          {isExpanded && (
                            <div className="mt-2 pl-11 pr-2 space-y-1.5">
                              {cat.items.map((item) => (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => toggleJunkItem(cat.id, item.id)}
                                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800/50 flex items-center justify-between gap-3 text-left transition-colors"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    {item.selected ? (
                                      <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    ) : (
                                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                                    )}
                                    <div className="min-w-0">
                                      <div className="text-xs font-medium text-slate-900 dark:text-slate-200 truncate">
                                        {item.name}
                                      </div>
                                      <div className="text-[11px] font-mono text-slate-400 truncate">
                                        {item.path}
                                      </div>
                                    </div>
                                  </div>
                                  <span className="text-xs font-mono tabular-nums text-slate-700 dark:text-slate-300 whitespace-nowrap shrink-0">
                                    {item.sizeMB} MB
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* MODULE 2: RAM BOOSTER & BACKGROUND APP HIBERNATION */}
            {(activeSection === 'dashboard' || activeSection === 'booster') && (
              <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      02. Acelerador de RAM e hibernación de procesos
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Detiene servicios en segundo plano que drenan batería y calientan el procesador
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleHibernateSelectedProcesses}
                    disabled={selectedProcessRamMB === 0}
                    className="min-h-[44px] px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 disabled:opacity-40 rounded-xl transition-colors whitespace-nowrap shrink-0"
                  >
                    Hibernar Apps ({selectedProcessRamMB} MB)
                  </button>
                </div>

                {/* Interactive Category Filter Bar */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl my-4 overflow-x-auto">
                  {['Todos', 'Social', 'Juegos', 'Multimedia', 'Productividad'].map(
                    (cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setProcessFilter(cat)}
                        className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                          processFilter === cat
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>

                {filteredProcesses.length === 0 ? (
                  <div className="py-10 text-center space-y-2">
                    <Gauge className="w-9 h-9 text-emerald-500 mx-auto" />
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Sin procesos drenantes activos en esta categoría
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      La memoria RAM y los núcleos de CPU operan con baja latencia.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredProcesses.map((proc) => (
                      <button
                        key={proc.id}
                        type="button"
                        onClick={() => toggleProcessSelection(proc.id)}
                        className="w-full min-h-[60px] py-3 px-2 flex items-center justify-between gap-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {proc.selected ? (
                            <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-400 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                              {proc.name}
                            </div>
                            {/* Zero-Pill Unboxed Metadata with typographic separators */}
                            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              <span className="font-mono">{proc.packageName}</span>
                              <span aria-hidden="true">·</span>
                              <span>CPU {proc.cpuPercent}%</span>
                              <span aria-hidden="true">·</span>
                              <span
                                className={
                                  proc.batteryImpact === 'Alto'
                                    ? 'text-amber-600 dark:text-amber-400 font-medium'
                                    : ''
                                }
                              >
                                Impacto {proc.batteryImpact}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-sm font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                            {proc.ramMB} MB
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                            Activo {proc.activeMinutes}m
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* MODULE 3: STORAGE & REAL FILE ANALYZER */}
            {(activeSection === 'dashboard' || activeSection === 'storage') && (
              <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      03. Analizador de archivos pesados, duplicados y APKs
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Libera gigabytes eliminando descargas repetidas o analiza carpetas reales de tu teléfono
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsFileScannerOpen(true)}
                      className="min-h-[44px] px-3.5 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl transition-colors whitespace-nowrap shrink-0"
                    >
                      Analizar Carpeta Local
                    </button>
                    <button
                      type="button"
                      onClick={handleCleanStorageItems}
                      disabled={selectedStorageMB === 0}
                      className="min-h-[44px] px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 disabled:opacity-40 rounded-xl transition-colors whitespace-nowrap shrink-0"
                    >
                      Eliminar ({selectedStorageMB.toFixed(0)} MB)
                    </button>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl my-4 overflow-x-auto">
                  {[
                    { id: 'Todos', label: 'Todos los archivos' },
                    { id: 'duplicate', label: 'Duplicados' },
                    { id: 'apk', label: 'Instaladores APK' },
                    { id: 'video', label: 'Videos Pesados' },
                    { id: 'download', label: 'Descargas' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setStorageFilter(tab.id)}
                      className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                        storageFilter === tab.id
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {filteredStorageItems.length === 0 ? (
                  <div className="py-10 text-center space-y-2">
                    <HardDrive className="w-9 h-9 text-emerald-500 mx-auto" />
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Sin archivos residuales en esta vista
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Puedes usar el botón "Analizar Carpeta Local" para inspeccionar archivos reales de tu dispositivo.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredStorageItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleStorageSelection(item.id)}
                        className="w-full min-h-[58px] py-3 px-2 flex items-center justify-between gap-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {item.selected ? (
                            <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-400 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                              {item.name}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 truncate">
                              <span className="font-mono truncate">{item.path}</span>
                              <span aria-hidden="true">·</span>
                              <span>{item.date}</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-sm font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0">
                          {item.sizeMB} MB
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Right 4 Columns: Auto-Optimization Scheduler & Activity Log */}
          <div className="lg:col-span-4 space-y-6">
            {/* Auto-Optimization Rules Card */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Piloto Automático Android
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Reglas autónomas de mantenimiento sin intervención
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoPilotActive(!autoPilotActive)}
                  className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    autoPilotActive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {autoPilotActive ? 'Activo' : 'Pausado'}
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
                {autoRules.map((rule) => (
                  <div key={rule.id} className="py-3.5 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {rule.title}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {rule.description}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1.5 font-mono tabular-nums">
                        <span>{rule.trigger}</span>
                        <span aria-hidden="true">·</span>
                        <span>{(rule.freedTotalMB / 1024).toFixed(1)} GB ahorrados</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleAutoRule(rule.id)}
                      className={`min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0`}
                      aria-label={`Alternar regla ${rule.title}`}
                    >
                      <div
                        className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                          rule.enabled && autoPilotActive
                            ? 'bg-emerald-600'
                            : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                            rule.enabled && autoPilotActive ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Optimization History Log */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Registro de mantenimiento reciente
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Historial verificable de limpiezas automáticas y manuales
                </p>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
                {historyLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="py-3 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{log.timestamp}</span>
                      <span>{log.mode}</span>
                    </div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {log.action}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                      {log.freedMB > 0 && <span>+{log.freedMB} MB disco</span>}
                      {log.freedMB > 0 && log.ramFreedMB > 0 && <span aria-hidden="true">·</span>}
                      {log.ramFreedMB > 0 && <span>+{log.ramFreedMB} MB RAM</span>}
                      <span aria-hidden="true">·</span>
                      <span>-{log.tempDropC} °C</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Mobile Ergonomic Bottom Navigation Bar (Natural Thumb Zone, <15% viewport height cap) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 grid grid-cols-5 items-center h-16 px-1">
        <button
          type="button"
          onClick={() => setActiveSection('dashboard')}
          className={`min-h-[44px] flex flex-col items-center justify-center ${
            activeSection === 'dashboard'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Zap className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1 whitespace-nowrap">
            Panel
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('cleaner')}
          className={`min-h-[44px] flex flex-col items-center justify-center ${
            activeSection === 'cleaner'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Trash2 className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1 whitespace-nowrap">
            Limpiador
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('booster')}
          className={`min-h-[44px] flex flex-col items-center justify-center ${
            activeSection === 'booster'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Cpu className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1 whitespace-nowrap">
            RAM y CPU
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('storage')}
          className={`min-h-[44px] flex flex-col items-center justify-center ${
            activeSection === 'storage'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <HardDrive className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1 whitespace-nowrap">
            Archivos
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('automation')}
          className={`min-h-[44px] flex flex-col items-center justify-center ${
            activeSection === 'automation'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1 whitespace-nowrap">
            Auto-Piloto
          </span>
        </button>
      </nav>

      {/* Modals for Real Local File Inspection & Native ADB Commands */}
      <LocalFileScannerModal
        isOpen={isFileScannerOpen}
        onClose={() => setIsFileScannerOpen(false)}
        onImportFiles={handleImportRealFiles}
      />
      <AdbToolkitModal
        isOpen={isAdbModalOpen}
        onClose={() => setIsAdbModalOpen(false)}
      />
    </div>
  );
}
