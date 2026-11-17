"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PERMISSIONS = exports.BROKER_PERMISSIONS = exports.ADMIN_PERMISSIONS = void 0;
exports.hasPermission = hasPermission;
exports.hasAllPermissions = hasAllPermissions;
exports.hasAnyPermission = hasAnyPermission;
exports.ADMIN_PERMISSIONS = [
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
exports.BROKER_PERMISSIONS = [
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
exports.ROLE_PERMISSIONS = {
    admin: exports.ADMIN_PERMISSIONS,
    broker: exports.BROKER_PERMISSIONS,
};
function hasPermission(role, permission) {
    const permissions = exports.ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
}
function hasAllPermissions(role, permissions) {
    return permissions.every((p) => hasPermission(role, p));
}
function hasAnyPermission(role, permissions) {
    return permissions.some((p) => hasPermission(role, p));
}
