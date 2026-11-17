import { UserRole } from '../types';

export type Permission =
  | 'enquiries.read.all'
  | 'enquiries.read.assigned'
  | 'enquiries.create'
  | 'enquiries.update'
  | 'enquiries.assign'
  | 'enquiries.archive'
  | 'brokers.read'
  | 'brokers.invite'
  | 'brokers.update'
  | 'brokers.deactivate'
  | 'catalogue.read'
  | 'catalogue.create'
  | 'catalogue.update'
  | 'catalogue.delete'
  | 'suppliers.read'
  | 'suppliers.manage'
  | 'proposals.read.all'
  | 'proposals.read.assigned'
  | 'proposals.create'
  | 'proposals.update'
  | 'proposals.dispatch'
  | 'bookings.read.all'
  | 'bookings.read.assigned'
  | 'bookings.manage'
  | 'bookings.confirm'
  | 'analytics.read.all'
  | 'analytics.read.assigned'
  | 'audit.read'
  | 'settings.manage';

export const ADMIN_PERMISSIONS: Permission[] = [
  'enquiries.read.all',
  'enquiries.read.assigned',
  'enquiries.create',
  'enquiries.update',
  'enquiries.assign',
  'enquiries.archive',
  'brokers.read',
  'brokers.invite',
  'brokers.update',
  'brokers.deactivate',
  'catalogue.read',
  'catalogue.create',
  'catalogue.update',
  'catalogue.delete',
  'suppliers.read',
  'suppliers.manage',
  'proposals.read.all',
  'proposals.read.assigned',
  'proposals.create',
  'proposals.update',
  'proposals.dispatch',
  'bookings.read.all',
  'bookings.read.assigned',
  'bookings.manage',
  'bookings.confirm',
  'analytics.read.all',
  'audit.read',
  'settings.manage',
];

export const BROKER_PERMISSIONS: Permission[] = [
  'enquiries.read.assigned',
  'enquiries.create',
  'enquiries.update',
  'catalogue.read',
  'suppliers.read',
  'proposals.read.assigned',
  'proposals.create',
  'proposals.update',
  'proposals.dispatch',
  'bookings.read.assigned',
  'bookings.manage',
  'analytics.read.assigned',
];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: ADMIN_PERMISSIONS,
  broker: BROKER_PERMISSIONS,
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}
