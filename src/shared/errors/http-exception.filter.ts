import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { Response } from 'express';
  import { AppError } from './app-error';
  
  @Catch()
  export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
  
      if (exception instanceof AppError) {
        return response
          .status(exception.httpStatus)
          .json({ code: exception.code, message: exception.message });
      }
  
      if (exception instanceof HttpException) {
        return response.status(exception.getStatus()).json(exception.getResponse());
      }
  
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        code: 'INTERNAL_ERROR',
        message: 'Unexpected server error',
      });
    }
  }
  