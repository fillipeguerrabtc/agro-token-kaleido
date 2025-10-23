import { createContext, useContext, ReactNode } from 'react';
import { useDeviceDetection, DeviceInfo } from '@/hooks/useDeviceDetection';

const DeviceContext = createContext<DeviceInfo | null>(null);

export function DeviceProvider({ children }: { children: ReactNode }) {
  const deviceInfo = useDeviceDetection();
  
  return (
    <DeviceContext.Provider value={deviceInfo}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDevice must be used within DeviceProvider');
  }
  return context;
}
