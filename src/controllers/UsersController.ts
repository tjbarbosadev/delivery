import type { Request, Response } from 'express';
import z from 'zod';
import { hash } from 'bcrypt';
import { prisma } from '@/database/prisma';
import { AppError } from '@/utils/AppError';

class UsersController {
  async index(req: Request, res: Response) {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return res.json(users);
  }

  async create(req: Request, res: Response) {
    const bodySchema = z.object({
      name: z.string().trim().min(3),
      email: z.string().email(),
      password: z.string().min(6),
      role: z.enum(['customer', 'sale']).optional(),
    });

    const { name, email, password, role } = bodySchema.parse(req.body);

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
        role: role || 'customer',
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json(userWithoutPassword);
  }

  async delete(req: Request, res: Response) {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = paramsSchema.parse(req.params);

    await prisma.user.delete({ where: { id } });

    return res.status(204).send('User deleted successfully');
  }
}

export { UsersController };
