// TypeScript augmentation for Prisma types to add missing fields
import '@prisma/client';
declare module '@prisma/client' {
  namespace Prisma {
    interface UserCreateInput {
      username?: string;
      department?: string | null;
      status?: string | null;
      moduleAccess?: any;
      isOwner?: boolean | null;
      // ... add other fields as needed
    }
    interface UserUncheckedCreateInput {
      username?: string;
      department?: string | null;
      status?: string | null;
      moduleAccess?: any;
      isOwner?: boolean | null;
      // ... add other fields as needed
    }
    interface OrganizationCreateInput {
      activeModules?: string[];
      size?: string | null;
      users?: any;
      // ... add other fields as needed
    }
    interface OrganizationUncheckedCreateInput {
      activeModules?: string[];
      size?: string | null;
      users?: any;
      // ... add other fields as needed
    }
  }
} 