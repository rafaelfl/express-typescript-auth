import bcrypt from "bcrypt";

const PASSWORD = "admin";
const SALT = 10;

const main = async () => {
  console.log("Generate password password");

  const salt = await bcrypt.genSalt(Number(SALT));
  const hashPassword = await bcrypt.hash(PASSWORD, salt);

  console.log("    -- Hashed password:", hashPassword);
};

main();
