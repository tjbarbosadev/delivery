import { Router } from 'express';

import { usersRoutes } from './usersRoutes';
import { sessionsRoutes } from './sessionRoutes';

const routes = Router();
routes.use('/users', usersRoutes);
routes.use('/sessions', sessionsRoutes);

export { routes };
