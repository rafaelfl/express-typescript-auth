import bcrypt from "bcrypt";

import { config } from "../config";

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(Number(config.salt));
  const hash = await bcrypt.hash(password, salt);

  return hash;
};
