export class AppError extends Error {
    constructor(
      public code: string,
      public message: string,
      public httpStatus = 400,
      public details?: unknown,
    ) {
      super(message);
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
  