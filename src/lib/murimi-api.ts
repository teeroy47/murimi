import { getAccessToken, getActiveFarmId, getApiBaseUrl } from "@/lib/murimi-session";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error: { message?: string } | null;
};

export class MurimiApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "MurimiApiError";
    this.status = status;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  farmScoped?: boolean;
  tokenOverride?: string;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${getApiBaseUrl()}${path}`;
  const token = options.tokenOverride ?? getAccessToken();
  const farmId = getActiveFarmId();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.farmScoped && farmId) headers["x-farm-id"] = farmId;

  const res = await fetch(url, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let payload: ApiEnvelope<T> | null = null;
  try {
    payload = (await res.json()) as ApiEnvelope<T>;
  } catch {
    if (!res.ok) throw new MurimiApiError(`HTTP ${res.status}`, res.status);
    throw new MurimiApiError("Invalid server response", res.status);
  }

  if (!res.ok || !payload.success) {
    const message =
      (payload?.error && "message" in payload.error && payload.error.message) ||
      `HTTP ${res.status}`;
    throw new MurimiApiError(Array.isArray(message) ? message.join(", ") : String(message), res.status);
  }
  return payload.data;
}

export async function apiLogin(email: string, password: string) {
  return apiRequest<{
    user: { id: string; email: string; displayName?: string | null };
    accessToken: string;
    refreshToken: string;
    refreshSessionId: string;
  }>("/auth/login", {
    method: "POST",
    body: { email, password },
    farmScoped: false,
  });
}

export async function apiGetFarms() {
  return apiRequest<Array<{
    id: string;
    userId: string;
    farmId: string;
    roleId: string;
    farm: { id: string; name: string; theme?: { primaryColor?: string | null } | null };
    role: { id: string; name: string };
  }>>("/farms", {
    farmScoped: false,
  });
}
