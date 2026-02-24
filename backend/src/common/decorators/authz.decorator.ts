import { applyDecorators, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiHeader } from "@nestjs/swagger";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { FarmMembershipGuard } from "../guards/farm-membership.guard";
import { PermissionsGuard } from "../guards/permissions.guard";
import { RequirePermissions } from "./permissions.decorator";

export function Authz(options?: { farm?: boolean; permissions?: string[] }) {
  const decorators = [ApiBearerAuth(), UseGuards(JwtAuthGuard)];
  if (options?.farm) {
    decorators.push(
      ApiHeader({ name: "x-farm-id", required: false, description: "Active farm context" }),
      UseGuards(FarmMembershipGuard, PermissionsGuard),
    );
    if (options.permissions?.length) {
      decorators.push(RequirePermissions(...options.permissions));
    }
  }
  return applyDecorators(...decorators);
}
