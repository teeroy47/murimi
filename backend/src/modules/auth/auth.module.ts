import {
  Body,
  Controller,
  Global,
  HttpCode,
  Module,
  Post,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { ApiTags } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";
import * as argon2 from "argon2";
import { randomBytes, createHash } from "crypto";
import { PrismaService } from "src/prisma/prisma.service";
import { Public } from "src/common/decorators/public.decorator";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { UsersModule, UsersService } from "../users/users.module";

class RegisterDto {
  @IsEmail()
  email!: string;
  @IsString()
  @MinLength(8)
  password!: string;
  @IsOptional()
  @IsString()
  displayName?: string;
}

class LoginDto {
  @IsEmail()
  email!: string;
  @IsString()
  password!: string;
}

class RefreshDto {
  @IsString()
  refreshToken!: string;
}

class LogoutDto {
  @IsString()
  refreshToken!: string;
}

@ApiTags("Auth")
@Controller("auth")
class AuthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  private issueAccess(user: { id: string; email: string }) {
    return this.jwt.sign(
      { sub: user.id, email: user.email, type: "access" },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.JWT_ACCESS_TTL ?? "15m",
      },
    );
  }

  private issueRefreshToken() {
    return randomBytes(48).toString("base64url");
  }

  private hashToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }

  async createSession(user: { id: string; email: string }) {
    const accessToken = this.issueAccess(user);
    const refreshToken = this.issueRefreshToken();
    const session = await this.prisma.refreshSession.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
    });
    return {
      accessToken,
      refreshToken,
      refreshSessionId: session.id,
    };
  }

  @Public()
  @Post("register")
  async register(@Body() dto: RegisterDto) {
    const existing = await this.users.findByEmail(dto.email.toLowerCase());
    if (existing) throw new UnauthorizedException("Email already registered");
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash: await argon2.hash(dto.password),
        displayName: dto.displayName,
      },
    });
    const tokens = await this.createSession({ id: user.id, email: user.email });
    return { user: { id: user.id, email: user.email, displayName: user.displayName }, ...tokens };
  }

  @Public()
  @Post("login")
  @HttpCode(200)
  async login(@Body() dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email.toLowerCase());
    if (!user || !(await argon2.verify(user.passwordHash, dto.password))) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const tokens = await this.createSession({ id: user.id, email: user.email });
    return { user: { id: user.id, email: user.email, displayName: user.displayName }, ...tokens };
  }

  @Public()
  @Post("refresh")
  @HttpCode(200)
  async refresh(@Body() dto: RefreshDto) {
    const tokenHash = this.hashToken(dto.refreshToken);
    const session = await this.prisma.refreshSession.findFirst({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
      include: { user: true },
    });
    if (!session) throw new UnauthorizedException("Invalid refresh token");

    const newRefresh = this.issueRefreshToken();
    const next = await this.prisma.refreshSession.create({
      data: {
        userId: session.userId,
        tokenHash: this.hashToken(newRefresh),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
    });
    await this.prisma.refreshSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date(), replacedById: next.id },
    });

    return {
      accessToken: this.issueAccess({ id: session.user.id, email: session.user.email }),
      refreshToken: newRefresh,
      refreshSessionId: next.id,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post("logout")
  @HttpCode(200)
  async logout(@Body() dto: LogoutDto, @CurrentUser() user: any) {
    await this.prisma.refreshSession.updateMany({
      where: {
        userId: user.userId,
        tokenHash: this.hashToken(dto.refreshToken),
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
    return { loggedOut: true };
  }
}

@Global()
@Module({
  imports: [
    UsersModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [JwtAuthGuard],
  exports: [JwtModule, JwtAuthGuard],
})
export class AuthModule {}
