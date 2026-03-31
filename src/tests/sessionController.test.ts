import request from 'supertest';
import { app } from '@/app';
import { prisma } from '@/database/prisma';

describe('SessionController', () => {
  let user_id: string;

  afterAll(async () => {
    await prisma.user.delete({ where: { id: user_id } });
  });

  it('should authenticate a user and return a token', async () => {
    // First, create a user to authenticate
    const userResponse = await request(app).post('/users').send({
      name: 'Auth Test User',
      email: 'auth.test.user@example.com',
      password: 'password123',
    });

    user_id = userResponse.body.id;

    const authResponse = await request(app).post('/sessions').send({
      email: 'auth.test.user@example.com',
      password: 'password123',
    });

    expect(authResponse.status).toBe(200);
    expect(authResponse.body.token).toEqual(expect.any(String));
  });
});
