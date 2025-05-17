export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId: string;
  department?: string;
  avatar?: string;
  moduleAccess?: string[];
} 