import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const FarmId = createParamDecorator((_data: unknown, ctx: ExecutionContext): string | undefined => {
  const req = ctx.switchToHttp().getRequest();
  return req.headers["x-farm-id"] as string | undefined;
});
