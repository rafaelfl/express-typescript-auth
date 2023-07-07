export const USER_ROLES = ["admin", "user"] as const;

export type UserRoles = (typeof USER_ROLES)[number];

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRoles;
}
