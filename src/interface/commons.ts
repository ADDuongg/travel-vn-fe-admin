import type { EnumRole } from '@/constants/enum';
import type { UIMatch } from 'react-router-dom';

export interface RouteConfig {
  path?: string;
  index?: boolean;
  element: React.ReactElement;
  children?: RouteConfig[];
  rolesAllowed?: EnumRole[];
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
  name: string;
  icon?: {
    url: string;
    publicId?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
