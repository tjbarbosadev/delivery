import { prisma } from '@/database/prisma';
import { Request, Response } from 'express';
import z from 'zod';

class DeliveriesStatusController {
  async update(req: Request, res: Response) {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    const bodySchema = z.object({
      status: z.enum(['pending', 'in_progress', 'delivered', 'canceled']),
    });

    const { id } = paramsSchema.parse(req.params);
    const { status } = bodySchema.parse(req.body);

    await prisma.delivery.update({
      where: { id },
      data: { status },
    });

    res.json({ message: 'Delivery status updated successfully' });
  }
}

export { DeliveriesStatusController };
