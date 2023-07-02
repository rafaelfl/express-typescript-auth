// import { Language, User } from "../custom";

// to make the file a module and avoid the TypeScript error
// export {}

declare global {
  namespace Express {
    export interface Request {
      msg?: string;
      //   language?: Language;
      //   user?: User;
    }
  }
}
