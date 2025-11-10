import { Body, Controller, Post, Res } from '@nestjs/common';
import express from 'express';
import { LoginService } from '../services/login.service';
import { TokenService } from '../services/token.service';
import { AdminLoginDto } from '../dtos/admin-login.dto';

@Controller('auth')
export class LoginController {
  constructor(
    private readonly login: LoginService,
    private readonly tokens: TokenService,
  ) {}

  /** Парольный вход админа → выдаём access/refresh */
  @Post('admin/login')
  async adminLogin(
    @Body() dto: AdminLoginDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const result = await this.login.loginAdminWithPassword(dto);
    // Если в loginService ты ставишь куки сам — эту строку можно убрать:
    this.tokens.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  /** Ротация access-токена по refresh-куке (MVP: можно оставить заглушкой, если ещё не готово) */
  @Post('refresh')
  async refresh(@Res({ passthrough: true }) res: express.Response) {
    // TODO: реализовать валидацию RT и ротацию.
    res.status(501);
    return { error: 'Not implemented yet' };
  }

  /** Выход: очищаем refresh-cookie */
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: express.Response) {
    this.tokens.clearRefreshCookie(res);
    return { ok: true };
  }
}
