export interface JunkCategory {
  id: string;
  name: string;
  description: string;
  sizeMB: number;
  selected: boolean;
  safeToClean: boolean;
  items: {
    id: string;
    name: string;
    path: string;
    sizeMB: number;
    selected: boolean;
  }[];
}

export interface BackgroundProcess {
  id: string;
  name: string;
  packageName: string;
  ramMB: number;
  cpuPercent: number;
  batteryImpact: 'Alto' | 'Medio' | 'Bajo';
  category: 'Social' | 'Juegos' | 'Sistema' | 'Multimedia' | 'Productividad';
  canStop: boolean;
  selected: boolean;
  activeMinutes: number;
}

export interface StorageItem {
  id: string;
  name: string;
  path: string;
  sizeMB: number;
  type: 'apk' | 'video' | 'duplicate' | 'cache' | 'download';
  date: string;
  selected: boolean;
}

export interface AutoScheduleRule {
  id: string;
  title: string;
  description: string;
  trigger: string;
  enabled: boolean;
  lastRun: string;
  freedTotalMB: number;
}

export interface OptimizationHistoryLog {
  id: string;
  timestamp: string;
  action: string;
  freedMB: number;
  ramFreedMB: number;
  tempDropC: number;
  mode: 'Automático' | 'Manual' | 'ADB Script';
}

export interface RealDeviceTelemetry {
  storageUsedBytes: number | null;
  storageQuotaBytes: number | null;
  batteryLevel: number | null;
  batteryCharging: boolean | null;
  deviceMemoryGB: number | null;
  cpuCores: number;
  userAgentModel: string;
  isAndroid: boolean;
}
