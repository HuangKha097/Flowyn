import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EntityManager, ObjectId } from '@mikro-orm/mongodb';
import { createHash } from 'crypto';
import { User, Role } from '../entities/User.entity';
import { AuthUser, JwtPayload } from './auth.types';
import { hashPassword, verifyPassword } from './password';

@Injectable()
export class AuthService {
  constructor(private readonly em: EntityManager, private readonly jwt: JwtService) {}

  async register(input: { name?: string; email?: string; password?: string }) {
    const name = input.name?.trim();
    const email = input.email?.trim().toLowerCase();
    this.validate(name, email, input.password);
    if (await this.em.findOne(User, { email: email! })) {
      throw new ConflictException('An account with this email already exists');
    }
    const user = this.em.create(User, {
      name: name!,
      email: email!,
      password: await hashPassword(input.password!),
      role: Role.STAFF,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.em.persistAndFlush(user);
    return this.createSession(user);
  }

  async login(input: { email?: string; password?: string }) {
    const email = input.email?.trim().toLowerCase();
    if (!email || !input.password) throw new UnauthorizedException('Invalid email or password');
    const user = await this.em.findOne(User, { email, deletedAt: null });
    if (!user || !(await verifyPassword(input.password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.createSession(user);
  }

  async refresh(refreshToken: string | undefined) {
    if (!refreshToken) throw new UnauthorizedException('Refresh token is missing');
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }
    if (payload.type !== 'refresh') throw new UnauthorizedException('Invalid token type');
    const user = await this.em.findOne(User, { _id: new ObjectId(payload.sub), deletedAt: null });
    if (!user?.refreshTokenHash || user.refreshTokenHash !== this.tokenHash(refreshToken)) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }
    return this.createSession(user);
  }

  async logout(userId?: string) {
    if (!userId) return;
    const user = await this.em.findOne(User, { _id: new ObjectId(userId) });
    if (user) {
      user.refreshTokenHash = undefined;
      await this.em.flush();
    }
  }

  async getUser(userId: string): Promise<AuthUser> {
    const user = await this.em.findOneOrFail(User, { _id: new ObjectId(userId), deletedAt: null });
    return this.publicUser(user);
  }

  private async createSession(user: User) {
    const base = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwt.signAsync(
      { ...base, type: 'access' satisfies JwtPayload['type'] },
      { secret: process.env.JWT_SECRET, expiresIn: (process.env.JWT_EXPIRES_IN ?? '15m') as never },
    );
    const refreshToken = await this.jwt.signAsync(
      { ...base, type: 'refresh' satisfies JwtPayload['type'] },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as never },
    );
    user.refreshTokenHash = this.tokenHash(refreshToken);
    await this.em.flush();
    return { user: this.publicUser(user), accessToken, refreshToken };
  }

  private publicUser(user: User): AuthUser {
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  private tokenHash(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private validate(name?: string, email?: string, password?: string) {
    if (!name || name.length > 100) throw new BadRequestException('Name is required and must be at most 100 characters');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new BadRequestException('A valid email is required');
    if (!password || password.length < 8) throw new BadRequestException('Password must be at least 8 characters');
  }
}
