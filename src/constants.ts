import { config } from "./config";

export const messages = {
  APP_SERVER_ERROR: "Oops, something went wrong!",
  NOT_FOUND: `Not Found. Try using /api/${config.API_VERSION} to access the api resource`,
  RESOURCE_NOT_FOUND: "No resource(s) found",
  ACCESS_DENIED: "Access denied! ❌",
  SUCCESS_LOGIN: "Succesful Login! 😊",
  SUCCESS_LOGOUT: "Succesful Logout! 🛫",
  NO_AUTH_TOKEN: "No auth token",
  INVALID_TOKEN: "Invalid token",
  EMPTY_TOKEN: "Refresh token unavailable",
  CANNOT_RETRIEVE_USER_DATA: "It was not possible to retrieve user data",
  EXISTING_EMAIL: "User with given email already exists",
  ACCOUNT_CREATED: "Account registered sucessfully",
  NOT_LOGGED: "Account not logged in",
  USER_NOT_FOUND: "User(s) not found",
  USER_NOT_UPDATED: "User not updated",
  UNABLE_DELETE_USER: "Unable to delete the current user",
};
