import { app } from '@/app';
import { prisma } from '@/database/prisma';
import request from 'supertest';

describe('UsersController', () => {
  let user_id: string;

  afterAll(async () => {
    await prisma.user.delete({ where: { id: user_id } });
  });

  it('should create a new user successfully', async () => {
    const response = await request(app).post('/users').send({
      name: 'Foo Bar',
      email: 'foo.bar@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Foo Bar');
    expect(response.body.email).toBe('foo.bar@example.com');

    user_id = response.body.id;
  });

  it('should not create a user with an existing email', async () => {
    const response = await request(app).post('/users').send({
      name: 'Foo Bar',
      email: 'foo.bar@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'Email already in use');
  });

  it('should throw a validation error when creating a user with invalid data', async () => {
    const response = await request(app).post('/users').send({
      name: 'Foo Bar',
      email: 'foo.bar.com',
      password: 'password123',
    });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('validation error');
  });
});
