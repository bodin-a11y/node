export class AppError extends Error {
    constructor(
      public code: string,
      public message: string,
      public httpStatus = 400,
      public details?: unknown,
      public cause?: unknown, // опционально: родная причина
    ) {
      super(message);
      this.name = 'AppError';
      Object.setPrototypeOf(this, new.target.prototype);
      // если поддерживается — сохраняем cause в Error
      // @ts-ignore
      if (this.cause && (Error as any).captureStackTrace) {
        (Error as any).captureStackTrace(this, AppError);
      }
    }
  
    static BadRequest(msg: string, code = 'BAD_REQUEST', details?: unknown) {
      return new AppError(code, msg, 400, details);
    }
  }
  
  
  export const Errors = {
    Unauthorized: () =>
      new AppError('UNAUTHORIZED', 'Access denied', 401),
    Forbidden: () =>
      new AppError('FORBIDDEN', 'Not enough permissions', 403),
    NotFound: (entity = 'Resource') =>
      new AppError('NOT_FOUND', `${entity} not found`, 404),
    Conflict: (msg: string) =>
      new AppError('CONFLICT', msg, 409),
  };
  