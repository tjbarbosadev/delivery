import { SessionsController } from '@/controllers/SessionController';
import { Router } from 'express';

const sessionRoutes = Router();
const sessionsController = new SessionsController();

const sessionsRoutes = Router();

sessionsRoutes.post('/', sessionsController.create);

export { sessionsRoutes };
