export interface IUserDocument {
  _id: string;
  username: string;
  password: string;
  role: "owner" | "admin" | "manager" | "employee";
  department: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  organizationId: string;
  isOwner: boolean;
  createdAt: Date;
  updatedAt: Date;
  permissions: { module: string; actions: string[] }[];
} 