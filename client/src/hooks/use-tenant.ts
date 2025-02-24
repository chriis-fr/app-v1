import { create } from 'zustand';

interface TenantStore {
  tenant: string | null;
  setTenant: (tenant: string) => void;
}

export const useTenant = create<TenantStore>((set) => ({
  tenant: window.location.host.split('.')[0],
  setTenant: (tenant) => set({ tenant })
})); 