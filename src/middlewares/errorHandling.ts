import { AppError } from '@/utils/AppError';
import type { NextFunction, Request, Response } from 'express';

export function errorHandling(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
    });
  }

  return res.status(500).json({
    status: 'error',
    message: error.message,
  });
}
