import { prisma } from '@/database/prisma';
import { AppError } from '@/utils/AppError';
import { compare } from 'bcrypt';
import { Request, Response } from 'express';
import z from 'zod';

class SessionsController {
  async create(req: Request, res: Response) {
    const bodySchema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    });

    const { email, password } = bodySchema.parse(req.body);

    const user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const passwordsMatch = await compare(password, user.password);

    if (!passwordsMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    return res.json({
      message: 'Session created',
      user: { id: user.id, name: user.name, email: user.email },
    });
  }
}

export { SessionsController };
