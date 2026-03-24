import { Router } from 'express';

const routes = Router();

import { usersRoutes } from './usersRoutes';

routes.use('/users', usersRoutes);

export { routes };
