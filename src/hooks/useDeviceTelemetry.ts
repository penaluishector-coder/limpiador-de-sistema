import { useState, useEffect } from 'react';
import { RealDeviceTelemetry } from '../types';

export function useDeviceTelemetry() {
  const [telemetry, setTelemetry] = useState<RealDeviceTelemetry>({
    storageUsedBytes: null,
    storageQuotaBytes: null,
    batteryLevel: null,
    batteryCharging: null,
    deviceMemoryGB: null,
    cpuCores: typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 8 : 8,
    userAgentModel: 'Android Device',
    isAndroid: false,
  });

  useEffect(() => {
    const ua = navigator.userAgent || '';
    const isAndroid = /Android/i.test(ua);
    let model = 'Android 15 · Snapdragon 8 Gen 3';
    if (isAndroid) {
      const match = ua.match(/Android\s+([\d.]+);\s*([^;)]+)/i);
      if (match) {
        model = `Android ${match[1]} · ${match[2].trim()}`;
      } else {
        model = 'Dispositivo Android Detectado';
      }
    }

    const navAny = navigator as unknown as {
      deviceMemory?: number;
      getBattery?: () => Promise<{
        level: number;
        charging: boolean;
        addEventListener: (type: string, listener: () => void) => void;
      }>;
    };

    const deviceMemoryGB = navAny.deviceMemory || 8;

    setTelemetry((prev) => ({
      ...prev,
      deviceMemoryGB,
      userAgentModel: model,
      isAndroid,
    }));

    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((estimate) => {
        setTelemetry((prev) => ({
          ...prev,
          storageUsedBytes: estimate.usage ?? null,
          storageQuotaBytes: estimate.quota ?? null,
        }));
      }).catch(() => {});
    }

    if (typeof navAny.getBattery === 'function') {
      navAny
        .getBattery()
        .then((battery) => {
          const updateBattery = () => {
            setTelemetry((prev) => ({
              ...prev,
              batteryLevel: Math.round(battery.level * 100),
              batteryCharging: battery.charging,
            }));
          };
          updateBattery();
          battery.addEventListener('levelchange', updateBattery);
          battery.addEventListener('chargingchange', updateBattery);
        })
        .catch(() => {});
    }
  }, []);

  return telemetry;
}
