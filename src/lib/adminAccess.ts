export type AdminPermission =
  | 'jobs'
  | 'services'
  | 'calendar'
  | 'blogs'
  | 'studies'
  | 'client_portal'
  | 'email_queue';

export type AdminAccessScope = 'full' | 'vacancies' | 'socioeconomic' | 'client_portal';

export type AdminUser = {
  id: number;
  username: string;
  display_name?: string;
  access_scope?: AdminAccessScope;
  permissions?: AdminPermission[];
};

export const adminScopeLabels: Record<AdminAccessScope, string> = {
  full: 'Acceso completo',
  vacancies: 'Área de vacantes',
  socioeconomic: 'Área de socioeconómicos',
  client_portal: 'REPSE / Portal de clientes',
};

const allPermissions: AdminPermission[] = [
  'jobs',
  'services',
  'calendar',
  'blogs',
  'studies',
  'client_portal',
  'email_queue',
];

export function adminPermissions(user: AdminUser): AdminPermission[] {
  // Sessions created before permissions were introduced keep full access.
  if (!user.access_scope && !Array.isArray(user.permissions)) return allPermissions;
  if (Array.isArray(user.permissions)) return user.permissions;
  if (user.access_scope === 'vacancies') return ['jobs'];
  if (user.access_scope === 'socioeconomic') return ['studies'];
  if (user.access_scope === 'client_portal') return ['client_portal'];
  return allPermissions;
}

export function adminCan(user: AdminUser, permission: AdminPermission): boolean {
  return adminPermissions(user).includes(permission);
}

export function adminPermissionForPath(pathname: string): AdminPermission | null {
  if (/^\/admin\/jobs(?:\/|$)/.test(pathname)) return 'jobs';
  if (/^\/admin\/services(?:\/|$)/.test(pathname)) return 'services';
  if (/^\/admin\/calendar(?:\/|$)/.test(pathname)) return 'calendar';
  if (/^\/admin\/blogs(?:\/|$)/.test(pathname)) return 'blogs';
  if (/^\/admin\/studies(?:\/|$)/.test(pathname)) return 'studies';
  if (/^\/admin\/(?:clients|service-inquiries)(?:\/|$)/.test(pathname)) return 'client_portal';
  if (/^\/admin\/email-queue(?:\/|$)/.test(pathname)) return 'email_queue';
  return null;
}

export function defaultAdminPath(user: AdminUser): string {
  const permissions = adminPermissions(user);
  if (permissions.includes('jobs')) return '/admin/jobs';
  if (permissions.includes('studies')) return '/admin/studies';
  if (permissions.includes('client_portal')) return '/admin/clients';
  if (permissions.includes('services')) return '/admin/services';
  if (permissions.includes('calendar')) return '/admin/calendar';
  if (permissions.includes('blogs')) return '/admin/blogs';
  if (permissions.includes('email_queue')) return '/admin/email-queue';
  return '/';
}
