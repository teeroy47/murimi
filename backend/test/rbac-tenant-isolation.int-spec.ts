import { FarmMembershipGuard } from "../src/common/guards/farm-membership.guard";

describe("RBAC + tenant isolation (integration-oriented guard test)", () => {
  it("rejects request when user is not a farm member", async () => {
    const prisma: any = {
      membership: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
    };
    const guard = new FarmMembershipGuard(prisma);
    const context: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          params: { farmId: "farm-a" },
          headers: {},
          user: { userId: "user-1" },
        }),
      }),
    };
    await expect(guard.canActivate(context)).rejects.toThrow("User is not a member of this farm");
  });

  it("attaches farm-scoped permissions for an active membership", async () => {
    const prisma: any = {
      membership: {
        findFirst: jest.fn().mockResolvedValue({
          roleId: "role-1",
          role: {
            rolePermissions: [
              { permission: { code: "animals.view" } },
              { permission: { code: "animals.edit" } },
            ],
          },
        }),
      },
    };
    const req: any = { params: { farmId: "farm-a" }, headers: {}, user: { userId: "user-1" } };
    const guard = new FarmMembershipGuard(prisma);
    const context: any = { switchToHttp: () => ({ getRequest: () => req }) };
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(req.user.activeFarmId).toBe("farm-a");
    expect(req.user.permissions).toEqual(expect.arrayContaining(["animals.view", "animals.edit"]));
  });
});
