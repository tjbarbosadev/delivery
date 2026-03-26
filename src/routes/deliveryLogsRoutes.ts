import { DeliveryLogsController } from '@/controllers/DeliveryLogsController';
import { ensureAuth } from '@/middlewares/ensureAuth';
import { verifyUserRole } from '@/middlewares/verifyUserRole';
import { Router } from 'express';

const deliveryLogsRoutes = Router();
const deliveryLogsController = new DeliveryLogsController();

deliveryLogsRoutes.post(
  '/',
  ensureAuth,
  verifyUserRole(['sale']),
  deliveryLogsController.create,
);

export { deliveryLogsRoutes };
