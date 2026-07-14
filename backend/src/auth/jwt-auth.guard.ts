import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ACCESS_COOKIE, readCookie } from './cookies';
import { JwtPayload } from './auth.types';

export interface AuthenticatedRequest extends Request { user?: JwtPayload }

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = readCookie(request.headers.cookie, ACCESS_COOKIE);
    if (!token) throw new UnauthorizedException('Access token is missing');
    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(token, { secret: process.env.JWT_SECRET });
      if (payload.type !== 'access') throw new Error('Invalid token type');
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Access token is invalid or expired');
    }
  }
}
