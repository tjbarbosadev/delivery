import express from 'express';
import 'express-async-errors';
import { errorHandling } from './middlewares/errorHandling';
import { routes } from './routes';

const app = express();

app.use(express.json());

app.use(errorHandling);

app.use(routes);

export { app };
