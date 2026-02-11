export interface CurrentUser {
  id: number | string;
  email: string;
  name?: string;
  organizationId?: number;
  needsOnboarding: boolean;
  role?: string;
}

export interface BarStation {
  id: number;
  organizationId: number;
  name: string;
  description?: string;
  isActive: boolean;
  assignedUsers?: User[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}
