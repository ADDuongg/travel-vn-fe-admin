export type AuthAccount = {
  _id: string;
  username: string;
  roles: string[];
  permissions: {
    routers: string[];
    apis: string[];
  };
};

export type LoginPayload = {
  access_token: string;
  account: AuthAccount;
};

export type LoginFormValues = {
  username: string;
  password: string;
};
