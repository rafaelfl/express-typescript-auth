import loginController from "./loginController";
import registerController from "./registerController";
import refreshTokenController from "./refreshTokenController";
import logoutController from "./logoutController";
import profileController from "./profileController";

const authController = {
  login: loginController,
  register: registerController,
  refreshToken: refreshTokenController,
  logout: logoutController,
  getProfile: profileController.getProfile,
  updateProfile: profileController.updateProfile,
};

export default authController;
