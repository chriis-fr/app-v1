import { create } from 'zustand';

interface Permission {
  module: string;
  actions: string[];
}

interface PermissionStore {
  permissions: Permission[];
  setPermissions: (permissions: Permission[]) => void;
  can: (module: string, action: string) => boolean;
}

export const usePermissions = create<PermissionStore>((set, get) => ({
  permissions: [],
  setPermissions: (permissions) => set({ permissions }),
  can: (module, action) => {
    const permission = get().permissions.find(p => p.module === module);
    return permission ? permission.actions.includes(action) : false;
  }
})); 