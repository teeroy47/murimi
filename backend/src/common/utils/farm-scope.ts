import { ForbiddenException } from "@nestjs/common";

export function requireFarmId(farmId?: string): string {
  if (!farmId) throw new ForbiddenException("Farm context missing");
  return farmId;
}
