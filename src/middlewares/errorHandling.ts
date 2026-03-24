import { AppError } from '@/utils/AppError';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { issue } from 'zod/v4/core/util.cjs';

export function errorHandling(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: 'app error',
      message: error.message,
    });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      status: 'validation error',
      issues: error.issues,
    });
  }

  return res.status(500).json({
    status: 'error',
    message: error.message,
  });
}
