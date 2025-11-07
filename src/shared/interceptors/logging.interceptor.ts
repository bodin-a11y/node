import {
    Injectable, NestInterceptor, ExecutionContext, CallHandler,
  } from '@nestjs/common';
  import { Observable, tap } from 'rxjs';
  import { LoggerService } from '../logger/logger.service';
  
  @Injectable()
  export class LoggingInterceptor implements NestInterceptor {
    constructor(private readonly logger: LoggerService) {}
  
    intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
      const req = ctx.switchToHttp().getRequest();
      const start = Date.now();
      return next.handle().pipe(
        tap(() =>
          this.logger.log(`${req.method} ${req.url} - ${Date.now() - start}ms`, 'HTTP'),
        ),
      );
    }
  }
  