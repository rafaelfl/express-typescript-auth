import { UserRoles } from "./user";

export interface JwtPayload {
  id: string;
  role: UserRoles;
  iat: number;
  exp: number;
}
