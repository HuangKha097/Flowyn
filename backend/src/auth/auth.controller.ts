import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ACCESS_COOKIE, REFRESH_COOKIE, clearAuthCookies, readCookie, setAuthCookies } from './cookies';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { AuthenticatedRequest } from './jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly jwt: JwtService) {}

  @Post('register')
  async register(@Body() body: { name?: string; email?: string; password?: string }, @Res({ passthrough: true }) res: Response) {
    const session = await this.auth.register(body);
    setAuthCookies(res, session.accessToken, session.refreshToken);
    return { user: session.user };
  }

  @Post('login')
  async login(@Body() body: { email?: string; password?: string }, @Res({ passthrough: true }) res: Response) {
    const session = await this.auth.login(body);
    setAuthCookies(res, session.accessToken, session.refreshToken);
    return { user: session.user };
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await this.auth.refresh(readCookie(req.headers.cookie, REFRESH_COOKIE));
    setAuthCookies(res, session.accessToken, session.refreshToken);
    return { user: session.user };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const access = readCookie(req.headers.cookie, ACCESS_COOKIE);
    let userId: string | undefined;
    if (access) {
      try { userId = this.jwt.decode<JwtPayload>(access)?.sub; } catch { /* cookie is still cleared */ }
    }
    await this.auth.logout(userId);
    clearAuthCookies(res);
    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: AuthenticatedRequest) {
    return this.auth.getUser(req.user!.sub);
  }
}
