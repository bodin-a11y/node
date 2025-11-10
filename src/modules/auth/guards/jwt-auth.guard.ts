import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

const IS_PUBLIC_KEY = 'isPublic'; // используем вместе с Public-декоратором ниже

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Разрешить публичные эндпоинты (@Public())
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
}

// Небольшой декоратор, чтобы пометить эндпоинт публичным (опционально)
import { SetMetadata } from '@nestjs/common';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
