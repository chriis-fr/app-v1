import { Request } from 'express';

export interface User {
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
}

export interface AuthRequest extends Request {
  user?: User;
} 