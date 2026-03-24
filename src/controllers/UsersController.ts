import type { Request, Response } from 'express';
import z from 'zod';

class UsersController {
  index(req: Request, res: Response) {
    return res.json({ message: 'Users index' });
  }

  create(req: Request, res: Response) {
    const bodySchema = z.object({
      name: z.string().trim().min(3),
      email: z.string().email(),
      password: z.string().min(6),
    });

    const { name, email, password } = bodySchema.parse(req.body);

    return res.json({
      message: 'User created',
      data: { name, email },
    });
  }
}

export { UsersController };
