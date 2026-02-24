import { randomUUID } from "crypto";

export function getRequestId(req: { headers?: Record<string, string> }) {
  return req.headers?.["x-request-id"] ?? randomUUID();
}
