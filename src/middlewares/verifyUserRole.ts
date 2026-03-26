import { AppError } from '@/utils/AppError';
import { Request, Response, NextFunction } from 'express';
import { tr } from 'zod/v4/locales';

function verifyUserRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const userRole = req.user?.role;

    if (!allowedRoles.includes(userRole)) {
      throw new AppError(
        'User does not have permission to access this resource',
        403,
      );
    }

    next();
  };
}

export { verifyUserRole };
