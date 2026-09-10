import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

function addDuration(base: Date, duration: string): Date {
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) return new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000);
  const value = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return new Date(base.getTime() + value * multipliers[unit]);
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private sanitizeUser(user: { passwordHash: string; [key: string]: unknown }) {
    const { passwordHash, ...rest } = user;
    return rest;
  }

  private async issueTokens(userId: string, email: string, role: UserRole) {
    const accessToken = await this.jwt.signAsync(
      { sub: userId, email },
      {
        secret: this.config.get<string>("JWT_ACCESS_SECRET"),
        expiresIn: this.config.get<string>("JWT_ACCESS_TTL") ?? "15m",
      },
    );

    const refreshTtl = this.config.get<string>("JWT_REFRESH_TTL") ?? "30d";
    const rawRefreshToken = await this.jwt.signAsync(
      { sub: userId },
      {
        secret: this.config.get<string>("JWT_REFRESH_SECRET"),
        expiresIn: refreshTtl,
      },
    );

    const tokenHash = await bcrypt.hash(rawRefreshToken, 10);
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt: addDuration(new Date(), refreshTtl),
      },
    });

    return { accessToken, refreshToken: rawRefreshToken, role };
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException("Пользователь с таким email уже зарегистрирован");

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        phone: dto.phone,
        role: dto.role ?? UserRole.USER,
        cityId: dto.cityId,
      },
    });

    const tokens = await this.issueTokens(user.id, user.email, user.role);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException("Неверный email или пароль");

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) throw new UnauthorizedException("Неверный email или пароль");

    const tokens = await this.issueTokens(user.id, user.email, user.role);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async refresh(rawRefreshToken: string) {
    let payload: { sub: string };
    try {
      payload = await this.jwt.verifyAsync(rawRefreshToken, {
        secret: this.config.get<string>("JWT_REFRESH_SECRET"),
      });
    } catch {
      throw new UnauthorizedException("Недействительный refresh token");
    }

    const tokens = await this.prisma.refreshToken.findMany({
      where: { userId: payload.sub, revoked: false, expiresAt: { gt: new Date() } },
    });

    let matched: (typeof tokens)[number] | null = null;
    for (const token of tokens) {
      if (await bcrypt.compare(rawRefreshToken, token.tokenHash)) {
        matched = token;
        break;
      }
    }
    if (!matched) throw new UnauthorizedException("Refresh token недействителен или отозван");

    await this.prisma.refreshToken.update({ where: { id: matched.id }, data: { revoked: true } });

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException("Пользователь не найден");

    const newTokens = await this.issueTokens(user.id, user.email, user.role);
    return { user: this.sanitizeUser(user), ...newTokens };
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
    return { success: true };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return this.sanitizeUser(user);
  }
}
