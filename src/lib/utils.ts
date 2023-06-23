export const safeParseJson = (str: string, fallback = {}) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
};
