import { prisma } from '@/database/prisma';
import { AppError } from '@/utils/AppError';
import { Request, Response } from 'express';
import z from 'zod';

class DeliveryLogsController {
  async index(req: Request, res: Response) {
    const paramsSchema = z.object({
      deliveryId: z.string().uuid(),
    });

    const { deliveryId } = paramsSchema.parse(req.params);

    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        logs: true,
      },
    });

    if (req.user.id !== delivery?.userId && req.user.role === 'customer') {
      throw new AppError('The user can only view their own delivery logs', 401);
    }

    res.json({ deliveryLogs: delivery?.logs || [] });
  }

  async create(req: Request, res: Response) {
    const bodySchema = z.object({
      deliveryId: z.string().uuid(),
      description: z.string().max(255),
    });

    const { deliveryId, description } = bodySchema.parse(req.body);

    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
    });

    if (!delivery) {
      throw new AppError('Delivery not found', 404);
    }

    if (delivery.status === 'pending') {
      throw new AppError(
        'Cannot add log to a pending delivery, change to in_progress',
        400,
      );
    }

    await prisma.deliveryLog.create({
      data: {
        deliveryId,
        description,
      },
    });

    res.json({ message: 'Delivery log created successfully' });
  }
}

export { DeliveryLogsController };
