import { create } from 'zustand';

interface BusinessStore {
  businessId: string | null;
  subdomain: string | null;
  setBusinessContext: (businessId: string, subdomain: string) => void;
}

export const useBusiness = create<BusinessStore>((set) => ({
  businessId: null,
  subdomain: window.location.host.split('.')[0],
  setBusinessContext: (businessId, subdomain) => set({ businessId, subdomain })
})); 