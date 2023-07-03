import { User, UserRoles, UserToken } from "../types";

interface Condition {
  id?: string;
  name?: string;
  email?: string;
  password?: string;
  role?: UserRoles;
  token?: string;
  userId?: string;
}

type Model = "user" | "token";

export interface IDatabase {
  findOne: (model: Model, condition: Condition) => Promise<User | UserToken | null>;
  create: (model: Model, condition: Condition) => Promise<User | UserToken | null>;
  remove: (model: Model, condition: Condition) => Promise<User | UserToken | null>;
  debug: (model?: Model) => void;
}
