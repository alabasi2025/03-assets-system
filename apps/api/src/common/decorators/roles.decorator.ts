import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export enum Role {
  ADMIN = 'admin',
  MANAGER = 'manager',
  TECHNICIAN = 'technician',
  VIEWER = 'viewer',
}

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
