import { AppError } from '@/utils/AppError';
import { Request, Response, NextFunction } from 'express';

type AllowedRoles = 'sale' | 'customer';

function verifyUserRole(allowedRoles: AllowedRoles[]) {
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
