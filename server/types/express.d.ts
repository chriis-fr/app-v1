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
      modulePermissions?: any[];
    }
    interface Request {
      user?: User;
    }
  }
} 