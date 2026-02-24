import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export interface AuthUserContext {
  userId: string;
  email: string;
  activeFarmId?: string;
  membershipRoleId?: string;
  permissions?: string[];
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUserContext => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
