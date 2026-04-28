import type { EnumRole } from '@/constants/enum';
import type { UIMatch } from 'react-router-dom';
import type { AmenityTranslation } from './room';

export interface RouteConfig {
  path?: string;
  index?: boolean;
  element: React.ReactElement;
  children?: RouteConfig[];
  /** @deprecated Prefer requiredPermission + RBAC. */
  rolesAllowed?: EnumRole[];
  /** Minimum RBAC key to render this route (see rbac-keys). */
  requiredPermission?: string;
  /** User must have every key (or super admin). Use for routes that need multiple API scopes. */
  requiredAllPermissions?: string[];
  /** Shell routes: require login without a specific permission key. */
  requiresAuth?: boolean;
  handle?: BreadcrumbHandle;
}

export type HeaderItemType = {
  name: string;
  label: string;
  path?: string;
  children?: HeaderItemType[];
};

export type CountryFlag = {
  label: string;
  code: string;
};

type CrumbRender = (
  match: UIMatch<Record<string, string>, BreadcrumbHandle>,
) => React.ReactNode;

export interface BreadcrumbHandle {
  breadcrumb: React.ReactNode | CrumbRender;
}

export type Language = {
  code: string;
  name: string;
  flagUrl?: string;
  isActive: boolean;
};

export type Amenity = {
  _id: string;
  /** Unique code for filtering (e.g. wifi, air_condition, pool) */
  code?: string;
  translations: Record<string, AmenityTranslation>;
  icon?: {
    url: string;
    publicId?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
