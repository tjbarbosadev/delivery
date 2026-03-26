import { prisma } from '@/database/prisma';
import { Request, Response } from 'express';
import z from 'zod';

class DeliveriesController {
  async index(req: Request, res: Response) {
    const deliveries = await prisma.delivery.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    res.json(deliveries);
  }

  async create(req: Request, res: Response) {
    const bodySchema = z.object({
      user_id: z.string(),
      description: z.string(),
    });

    const { user_id, description } = bodySchema.parse(req.body);

    await prisma.delivery.create({
      data: {
        userId: user_id,
        description,
      },
    });

    res.status(201).json({ message: 'Delivery created successfully' });
  }
}

export { DeliveriesController };
