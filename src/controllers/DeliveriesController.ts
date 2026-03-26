import { Request, Response } from 'express';

class DeliveriesController {
  async create(req: Request, res: Response) {
    res.json({ message: 'Create delivery' });
  }
}

export { DeliveriesController };
