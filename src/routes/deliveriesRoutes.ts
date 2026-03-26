import { DeliveriesController } from '@/controllers/DeliveriesController';
import { ensureAuth } from '@/middlewares/ensureAuth';
import { verifyUserRole } from '@/middlewares/verifyUserRole';
import { Router } from 'express';

const deliveriesRoutes = Router();
const deliveriesController = new DeliveriesController();

deliveriesRoutes.post(
  '/',
  ensureAuth,
  verifyUserRole(['sale']),
  deliveriesController.create,
);
deliveriesRoutes.get('/', ensureAuth, deliveriesController.index);

export { deliveriesRoutes };
