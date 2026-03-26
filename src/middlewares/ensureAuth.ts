import { authConfig } from '@/configs/auth';
import { AppError } from '@/utils/AppError';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  sub: string;
  role: 'customer' | 'sale';
}

function ensureAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError('Token is missing', 401);
  }

  const [, token] = authHeader.split(' ');

  if (!token) {
    throw new AppError('Token is missing', 401);
  }

  const { sub, role } = jwt.verify(
    token,
    authConfig.jwt.secret as string,
  ) as TokenPayload;

  req.user = { id: sub, role };

  next();
}

export { ensureAuth };
