import { convertTimeStrToMillisec, env } from "./utils";

describe("Utility functions tests", () => {
  afterAll(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe("env function", () => {
    it("should retrieve the environment variable using the env function", () => {
      process.env.TEST_VAR1 = "VAL";

      expect(env("TEST_VAR1")).toEqual("VAL");
    });

    it("should return undefined in case no value is available and no default value was provided", () => {
      expect(env("TEST_VAR2")).toBeNull();
    });

    it("should return the default variable in case no value is available", () => {
      expect(env("TEST_VAR3", "VAL")).toEqual("VAL");
    });

    it("should return true in case the string true is stored in the environment var", () => {
      process.env.TEST_VAR4 = "true";

      expect(env("TEST_VAR4", "VAL")).toBeTruthy();
    });

    it("should return false in case the string false is stored in the environment var", () => {
      process.env.TEST_VAR5 = "false";

      expect(env("TEST_VAR5", "VAL")).toBeFalsy();
    });

    it("should return an empty string in case the string (empty) is stored in the environment var", () => {
      process.env.TEST_VAR6 = "(empty)";

      expect(env("TEST_VAR6", "VAL")).toEqual("");
    });
  });

  describe("convertTimeStrToMillisec function", () => {
    it("should return 1000 ms when 1s is passed as parameter", () => {
      expect(convertTimeStrToMillisec("1s")).toEqual(1000);
    });

    it("should return 60000 ms when 1m is passed as parameter", () => {
      expect(convertTimeStrToMillisec("1m")).toEqual(60000);
    });

    it("should return 3600000 ms when 1h is passed as parameter", () => {
      expect(convertTimeStrToMillisec("1h")).toEqual(3600000);
    });

    it("should return 0 ms when an empty string is passed as parameter", () => {
      expect(convertTimeStrToMillisec("")).toEqual(0);
    });

    it("should return 0 ms when no value is passed as parameter", () => {
      expect(convertTimeStrToMillisec("m")).toEqual(0);
    });

    it("should return 1000 ms when 1x is passed as parameter (since an invalid unit is considered as seconds)", () => {
      expect(convertTimeStrToMillisec("1x")).toEqual(1000);
    });
  });
});
