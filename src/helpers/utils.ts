/**
 * Gets the value of an environment variable.
 *
 * @param {string} key - Environment variable key
 * @param {string|number|boolean} defaultValue - Value will be used if no environment
 * variable exists for the given key
 * @returns {string|number|boolean} The environment variable value
 */
export const env = (key: string, defaultValue: string | number | boolean | null = null) => {
  const value = process.env[key];

  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "(empty)") return "";
  return value || defaultValue;
};

export const convertTimeStrToMillisec = (timeString: string) =>
  timeString.match(/\d+\s?\w/g)?.reduce((acc, cur) => {
    let multiplier = 1000;

    const unit = cur.slice(-1);

    if (unit === "h") {
      multiplier *= 60 * 60;
    }

    if (unit === "m") {
      multiplier *= 60;
    }

    const curVal = parseInt(cur, 10);

    return (curVal || 0) * multiplier + acc;
  }, 0);
