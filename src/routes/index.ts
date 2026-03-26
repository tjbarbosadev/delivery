import { Router } from 'express';

import { usersRoutes } from './usersRoutes';
import { sessionsRoutes } from './sessionRoutes';
import { deliveriesRoutes } from './deliveriesRoutes';
import { deliveryLogsRoutes } from './deliveryLogsRoutes';

const routes = Router();

routes.use('/users', usersRoutes);
routes.use('/sessions', sessionsRoutes);
routes.use('/deliveries', deliveriesRoutes);
routes.use('/delivery-logs', deliveryLogsRoutes);

export { routes };
