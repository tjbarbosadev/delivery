import { UsersController } from '@/controllers/UsersController';
import { Router } from 'express';

const usersRoutes = Router();
const usersController = new UsersController();

usersRoutes.get('/', usersController.index);

export { usersRoutes };
