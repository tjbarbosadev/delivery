import type { Request, Response } from 'express';
import z from 'zod';
import { hash } from 'bcrypt';
import { prisma } from '@/database/prisma';
import { AppError } from '@/utils/AppError';

class UsersController {
  index(req: Request, res: Response) {
    return res.json({ message: 'Users index' });
  }

  async create(req: Request, res: Response) {
    const bodySchema = z.object({
      name: z.string().trim().min(3),
      email: z.string().email(),
      password: z.string().min(6),
    });

    const { name, email, password } = bodySchema.parse(req.body);

    const userWithEmail = await prisma.user.findFirst({ where: { email } });

    if (userWithEmail) {
      throw new AppError('Email already in use', 400);
    }

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json({ userWithoutPassword });
  }
}

export { UsersController };
