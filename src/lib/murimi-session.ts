const KEYS = {
  apiBaseUrl: "murimi.apiBaseUrl",
  accessToken: "murimi.accessToken",
  refreshToken: "murimi.refreshToken",
  farmId: "murimi.farmId",
} as const;

const DEFAULT_API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001/api";

function getStorage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function getApiBaseUrl() {
  return getStorage()?.getItem(KEYS.apiBaseUrl) || DEFAULT_API_BASE_URL;
}

export function setApiBaseUrl(url: string) {
  getStorage()?.setItem(KEYS.apiBaseUrl, url.replace(/\/+$/, ""));
}

export function getAccessToken() {
  return getStorage()?.getItem(KEYS.accessToken) || "";
}

export function setAuthTokens(tokens: { accessToken: string; refreshToken?: string }) {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(KEYS.accessToken, tokens.accessToken);
  if (tokens.refreshToken) storage.setItem(KEYS.refreshToken, tokens.refreshToken);
}

export function clearAuthSession() {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(KEYS.accessToken);
  storage.removeItem(KEYS.refreshToken);
}

export function getActiveFarmId() {
  return getStorage()?.getItem(KEYS.farmId) || "";
}

export function setActiveFarmId(farmId: string) {
  getStorage()?.setItem(KEYS.farmId, farmId);
}

export function getConnectionSnapshot() {
  return {
    apiBaseUrl: getApiBaseUrl(),
    accessToken: getAccessToken(),
    farmId: getActiveFarmId(),
    isConfigured: Boolean(getAccessToken() && getActiveFarmId()),
  };
}
