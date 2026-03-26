import { Router } from 'express';

import { usersRoutes } from './usersRoutes';
import { sessionsRoutes } from './sessionRoutes';
import { deliveriesRoutes } from './deliveriesRoutes';

const routes = Router();

routes.use('/users', usersRoutes);
routes.use('/sessions', sessionsRoutes);
routes.use('/deliveries', deliveriesRoutes);

export { routes };
