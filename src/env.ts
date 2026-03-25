import z from 'zod';

const envSchema = z.object({
  PORT: z.string().transform((value) => parseInt(value, 10)),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
});

const env = envSchema.parse(process.env);

export { env };
