import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    // Если роли не заданы — доступ открыт (достаточно токена через JwtAuthGuard)
    if (!required || required.length === 0) return true;

    const req = ctx.switchToHttp().getRequest();
    const user = req.user as { roles?: string[] };

    if (!user?.roles?.length) {
      throw new ForbiddenException('No roles found on user');
    }

    const ok = required.some((r) => user.roles.includes(r));
    if (!ok) {
      throw new ForbiddenException('Insufficient role');
    }
    return true;
  }
}
