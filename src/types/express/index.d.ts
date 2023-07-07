import { UserRoles } from "types/user";

export {};

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: UserRoles;
      tokenExp?: number;
    }
  }
}
