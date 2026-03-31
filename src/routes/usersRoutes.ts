import { UsersController } from '@/controllers/UsersController';
import { ensureAuth } from '@/middlewares/ensureAuth';
import { verifyUserRole } from '@/middlewares/verifyUserRole';
import { Router } from 'express';

const usersRoutes = Router();
const usersController = new UsersController();

usersRoutes.get('/', usersController.index);
usersRoutes.post('/', usersController.create);
usersRoutes.delete(
  '/:id',
  ensureAuth,
  verifyUserRole(['sale']),
  usersController.delete,
);

export { usersRoutes };
