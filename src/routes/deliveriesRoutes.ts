import { DeliveriesController } from '@/controllers/DeliveriesController';
import { DeliveriesStatusController } from '@/controllers/DeliveriesStatusController';
import { ensureAuth } from '@/middlewares/ensureAuth';
import { verifyUserRole } from '@/middlewares/verifyUserRole';
import { Router } from 'express';

const deliveriesRoutes = Router();
const deliveriesController = new DeliveriesController();
const deliveriesStatusController = new DeliveriesStatusController();

deliveriesRoutes.use(ensureAuth, verifyUserRole(['sale']));

deliveriesRoutes.post('/', deliveriesController.create);
deliveriesRoutes.get('/', deliveriesController.index);
deliveriesRoutes.patch('/:id/status', deliveriesStatusController.update);
export { deliveriesRoutes };
