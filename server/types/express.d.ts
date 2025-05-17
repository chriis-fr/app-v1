import { User } from './index';

declare global {
  namespace Express {
    interface User {
      id: string;
      organizationId: string;
      role: string;
      email: string;
      isOwner: boolean;
      moduleAccess: string[];
      permissions: {
        module: string;
        actions: string[];
      }[];
      modulePermissions: {
        module: string;
        permissions: string[];
      }[];
    }
    interface Request {
      user?: User;
    }
  }
} 