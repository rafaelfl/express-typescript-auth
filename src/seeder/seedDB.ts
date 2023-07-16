import { exec } from "child_process";

import { config, loadConfigVariables } from "../config";

loadConfigVariables();

const seedDB = async () => {
  exec(
    `mongorestore -d authusers -u ${config.databaseUser} -p ${config.databasePassword} "${config.databaseUrl}" ./src/seeder/authusers/`,
    (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(stdout);
    },
  );
};

seedDB();
