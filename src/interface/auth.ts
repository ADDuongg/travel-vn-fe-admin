export type AuthAccount = {
  _id: string;
  username: string;
  roles: string[];
  /** Legacy; not used for new admin guards — prefer rbacPermissions. */
  permissions: {
    routers: string[];
    apis: string[];
  };
  /** Flat RBAC keys `resource.action` — use for admin UI guards. */
  rbacPermissions?: string[];
  /** When true, UI may show all modules; API still enforces JWT on server. */
  isSuperAdmin?: boolean;
};

export type LoginPayload = {
  access_token: string;
  account: AuthAccount;
};

export type LoginFormValues = {
  username: string;
  password: string;
};
