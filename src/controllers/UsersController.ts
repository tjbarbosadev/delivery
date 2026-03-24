import type { Request, Response } from 'express';

class UsersController {
  public async index(req: Request, res: Response) {
    return res.json({ message: 'Users index' });
  }

  public async show(req: Request, res: Response) {
    const { id } = req.params;
    return res.json({ message: `User ${id}` });
  }
}

export { UsersController };
