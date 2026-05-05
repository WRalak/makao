// Role-based access control system for Makao Platform

export type UserRole = 'super_admin' | 'admin' | 'agent' | 'tenant';

export interface UserPermissions {
  // Super Admin permissions
  createAdminAccounts: boolean;
  modifyAdminAccounts: boolean;
  deleteAdminAccounts: boolean;
  setPlatformPolicies: boolean;
  accessAllUserData: boolean;
  overrideSystemDecisions: boolean;
  configureInfrastructure: boolean;
  manageDatabaseMigrations: boolean;
  
  // Admin permissions
  viewPlatformStatistics: boolean;
  manageAgentRequests: boolean;
  manageUsers: boolean;
  managePayments: boolean;
  moderateContent: boolean;
  managePlatformSettings: boolean;
  viewAdminAnalytics: boolean;
  handleDisputes: boolean;
  performSystemMaintenance: boolean;
  
  // Agent permissions
  manageProperties: boolean;
  manageSpaces: boolean;
  communicateWithTenants: boolean;
  manageLeads: boolean;
  processApplications: boolean;
  manageTours: boolean;
  viewAgentAnalytics: boolean;
  manageAgentProfile: boolean;
  
  // Tenant permissions
  browseProperties: boolean;
  saveProperties: boolean;
  sendMessage: boolean;
  submitApplications: boolean;
  manageTenantProfile: boolean;
  viewSavedProperties: boolean;
  rateAgents: boolean;
  
  // Common permissions
  viewDashboard: boolean;
  updateProfile: boolean;
  changePassword: boolean;
  viewNotifications: boolean;
}

export const rolePermissions: Record<UserRole, UserPermissions> = {
  super_admin: {
    // Super Admin - Full control
    createAdminAccounts: true,
    modifyAdminAccounts: true,
    deleteAdminAccounts: true,
    setPlatformPolicies: true,
    accessAllUserData: true,
    overrideSystemDecisions: true,
    configureInfrastructure: true,
    manageDatabaseMigrations: true,
    
    // Admin permissions (inherited)
    viewPlatformStatistics: true,
    manageAgentRequests: true,
    manageUsers: true,
    managePayments: true,
    moderateContent: true,
    managePlatformSettings: true,
    viewAdminAnalytics: true,
    handleDisputes: true,
    performSystemMaintenance: true,
    
    // Agent permissions (inherited)
    manageProperties: true,
    manageSpaces: true,
    communicateWithTenants: true,
    manageLeads: true,
    processApplications: true,
    manageTours: true,
    viewAgentAnalytics: true,
    manageAgentProfile: true,
    
    // Tenant permissions (inherited)
    browseProperties: true,
    saveProperties: true,
    sendMessage: true,
    submitApplications: true,
    manageTenantProfile: true,
    viewSavedProperties: true,
    rateAgents: true,
    
    // Common permissions
    viewDashboard: true,
    updateProfile: true,
    changePassword: true,
    viewNotifications: true,
  },
  
  admin: {
    // Super Admin permissions (denied)
    createAdminAccounts: false,
    modifyAdminAccounts: false,
    deleteAdminAccounts: false,
    setPlatformPolicies: false,
    accessAllUserData: false,
    overrideSystemDecisions: false,
    configureInfrastructure: false,
    manageDatabaseMigrations: false,
    
    // Admin permissions
    viewPlatformStatistics: true,
    manageAgentRequests: true,
    manageUsers: true,
    managePayments: true,
    moderateContent: true,
    managePlatformSettings: true,
    viewAdminAnalytics: true,
    handleDisputes: true,
    performSystemMaintenance: true,
    
    // Agent permissions (limited)
    manageProperties: false,
    manageSpaces: false,
    communicateWithTenants: false,
    manageLeads: false,
    processApplications: false,
    manageTours: false,
    viewAgentAnalytics: false,
    manageAgentProfile: false,
    
    // Tenant permissions (limited)
    browseProperties: false,
    saveProperties: false,
    sendMessage: false,
    submitApplications: false,
    manageTenantProfile: false,
    viewSavedProperties: false,
    rateAgents: false,
    
    // Common permissions
    viewDashboard: true,
    updateProfile: true,
    changePassword: true,
    viewNotifications: true,
  },
  
  agent: {
    // Super Admin permissions (denied)
    createAdminAccounts: false,
    modifyAdminAccounts: false,
    deleteAdminAccounts: false,
    setPlatformPolicies: false,
    accessAllUserData: false,
    overrideSystemDecisions: false,
    configureInfrastructure: false,
    manageDatabaseMigrations: false,
    
    // Admin permissions (denied)
    viewPlatformStatistics: false,
    manageAgentRequests: false,
    manageUsers: false,
    managePayments: false,
    moderateContent: false,
    managePlatformSettings: false,
    viewAdminAnalytics: false,
    handleDisputes: false,
    performSystemMaintenance: false,
    
    // Agent permissions
    manageProperties: true,
    manageSpaces: true,
    communicateWithTenants: true,
    manageLeads: true,
    processApplications: true,
    manageTours: true,
    viewAgentAnalytics: true,
    manageAgentProfile: true,
    
    // Tenant permissions (limited)
    browseProperties: false,
    saveProperties: false,
    sendMessage: false,
    submitApplications: false,
    manageTenantProfile: false,
    viewSavedProperties: false,
    rateAgents: false,
    
    // Common permissions
    viewDashboard: true,
    updateProfile: true,
    changePassword: true,
    viewNotifications: true,
  },
  
  tenant: {
    // Super Admin permissions (denied)
    createAdminAccounts: false,
    modifyAdminAccounts: false,
    deleteAdminAccounts: false,
    setPlatformPolicies: false,
    accessAllUserData: false,
    overrideSystemDecisions: false,
    configureInfrastructure: false,
    manageDatabaseMigrations: false,
    
    // Admin permissions (denied)
    viewPlatformStatistics: false,
    manageAgentRequests: false,
    manageUsers: false,
    managePayments: false,
    moderateContent: false,
    managePlatformSettings: false,
    viewAdminAnalytics: false,
    handleDisputes: false,
    performSystemMaintenance: false,
    
    // Agent permissions (denied)
    manageProperties: false,
    manageSpaces: false,
    communicateWithTenants: false,
    manageLeads: false,
    processApplications: false,
    manageTours: false,
    viewAgentAnalytics: false,
    manageAgentProfile: false,
    
    // Tenant permissions
    browseProperties: true,
    saveProperties: true,
    sendMessage: true,
    submitApplications: true,
    manageTenantProfile: true,
    viewSavedProperties: true,
    rateAgents: true,
    
    // Common permissions
    viewDashboard: true,
    updateProfile: true,
    changePassword: true,
    viewNotifications: true,
  },
};

export const roleHierarchy: UserRole[] = ['tenant', 'agent', 'admin', 'super_admin'];

export function getRoleLevel(role: UserRole): number {
  return roleHierarchy.indexOf(role);
}

export function canAccessResource(userRole: UserRole, requiredRole: UserRole): boolean {
  return getRoleLevel(userRole) >= getRoleLevel(requiredRole);
}

export function hasPermission(userRole: UserRole, permission: keyof UserPermissions): boolean {
  return rolePermissions[userRole][permission];
}

export function getRedirectPath(role: UserRole): string {
  switch (role) {
    case 'super_admin':
    case 'admin':
      return '/admin/dashboard';
    case 'agent':
      return '/agent/dashboard';
    case 'tenant':
      return '/tenant/dashboard';
    default:
      return '/login';
  }
}

export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'super_admin':
      return 'Super Admin';
    case 'admin':
      return 'Admin';
    case 'agent':
      return 'Agent';
    case 'tenant':
      return 'Tenant';
    default:
      return 'User';
  }
}

export function getRoleDescription(role: UserRole): string {
  switch (role) {
    case 'super_admin':
      return 'Platform Creator with full system control';
    case 'admin':
      return 'Platform Owner managing operations and users';
    case 'agent':
      return 'Property Manager listing and managing properties';
    case 'tenant':
      return 'Renter searching for and renting properties';
    default:
      return 'Platform user';
  }
}

export function getRoleColor(role: UserRole): string {
  switch (role) {
    case 'super_admin':
      return 'bg-red-100 text-red-800';
    case 'admin':
      return 'bg-purple-100 text-purple-800';
    case 'agent':
      return 'bg-blue-100 text-blue-800';
    case 'tenant':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getRoleIcon(role: UserRole): string {
  switch (role) {
    case 'super_admin':
      return '👑';
    case 'admin':
      return '🛡️';
    case 'agent':
      return '🏢';
    case 'tenant':
      return '🏠';
    default:
      return '👤';
  }
}

export function canUpgradeRole(currentRole: UserRole, targetRole: UserRole): boolean {
  return getRoleLevel(currentRole) >= getRoleLevel(targetRole);
}

export function canDowngradeRole(currentRole: UserRole, targetRole: UserRole): boolean {
  return getRoleLevel(currentRole) <= getRoleLevel(targetRole);
}

export function getAccessibleRoutes(role: UserRole): string[] {
  const baseRoutes = ['/login', '/register', '/properties'];
  
  switch (role) {
    case 'super_admin':
      return [
        ...baseRoutes,
        '/admin/dashboard',
        '/admin/users',
        '/admin/agents',
        '/admin/payments',
        '/admin/properties',
        '/admin/messages',
        '/admin/settings',
        '/admin/analytics',
        '/admin/disputes',
        '/admin/maintenance',
        '/agent/dashboard', // Can access agent pages
        '/tenant/dashboard', // Can access tenant pages
      ];
      
    case 'admin':
      return [
        ...baseRoutes,
        '/admin/dashboard',
        '/admin/users',
        '/admin/agents',
        '/admin/payments',
        '/admin/properties',
        '/admin/messages',
        '/admin/settings',
        '/admin/analytics',
        '/admin/disputes',
      ];
      
    case 'agent':
      return [
        ...baseRoutes,
        '/agent/dashboard',
        '/agent/spaces',
        '/agent/properties',
        '/agent/properties/add',
        '/agent/messages',
        '/agent/payments',
        '/agent/analytics',
        '/agent/profile',
      ];
      
    case 'tenant':
      return [
        ...baseRoutes,
        '/tenant/dashboard',
        '/tenant/saved',
        '/tenant/messages',
        '/tenant/applications',
        '/tenant/profile',
        '/tenant/reviews',
      ];
      
    default:
      return baseRoutes;
  }
}

export function validateRoleAccess(userRole: UserRole, route: string): boolean {
  const accessibleRoutes = getAccessibleRoutes(userRole);
  return accessibleRoutes.includes(route) || accessibleRoutes.some(r => route.startsWith(r));
}

export function getRequiredRole(route: string): UserRole | null {
  if (route.startsWith('/admin/')) return 'admin';
  if (route.startsWith('/agent/')) return 'agent';
  if (route.startsWith('/tenant/')) return 'tenant';
  return null;
}
