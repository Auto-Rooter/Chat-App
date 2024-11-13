import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (err instanceof AppError) {
      // Operational error, trusted error
      res.status(err.statusCode).json({
        status: 'error',
        message: err.message,
      });
    } else {
      // Programming or unknown error
      console.error('[x] ERROR', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong!',
      });
    }
  }