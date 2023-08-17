import { config } from "./config";

export const messages = {
  APP_SERVER_ERROR: "Oops, something went wrong!",
  NOT_FOUND: `Not Found. Try using /api/${config.API_VERSION} to access the api resource`,
  RESOURCE_NOT_FOUND: "No resource(s) found",
  ACCESS_DENIED: "Access denied! ❌",
  SUCCESS_LOGIN: "Successful Login! 😊",
  SUCCESS_LOGOUT: "Successful Logout! 🛫",
  NO_AUTH_TOKEN: "No auth token",
  INVALID_TOKEN: "Invalid token",
  EMPTY_TOKEN: "Refresh token unavailable",
  CANNOT_RETRIEVE_USER_DATA: "It was not possible to retrieve user data",
  EXISTING_EMAIL: "User with given email already exists",
  ACCOUNT_CREATED: "Account registered sucessfully",
  NOT_LOGGED: "Account not logged in",
  UNABLE_RETRIEVE_USER: "Unable to retrieve user data",
  UNABLE_UPDATE_USER: "Unable to update user data",
  UNABLE_DELETE_USER: "Unable to delete user data",
  CANT_DELETE_OWN_USER: "You cannot delete your own user",
  UNABLE_RETRIEVE_DATA: "Unable to retrieve data",
};
