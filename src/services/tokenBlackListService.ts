import redisClient from "../redisDatabase";

export const tokenBlackListService = {
  addTokenToBlacklist: async (token: string, tokenExp: number) => {
    if (redisClient.isReady) {
      const tokenKey = `bl_${token}`;
      await redisClient.set(tokenKey, token);
      redisClient.expireAt(tokenKey, tokenExp);
    }
  },

  isTokenBlackListed: async (token: string) => {
    if (redisClient.isReady) {
      const tokenKey = `bl_${token}`;
      const val = await redisClient.get(tokenKey);

      return !!val;
    }

    return false;
  },
};
