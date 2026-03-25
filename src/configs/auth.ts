import { env } from '@/env';
import type { SignOptions } from 'jsonwebtoken';

type AuthConfig = {
  jwt: {
    secret: string | undefined;
    expiresIn: SignOptions['expiresIn'];
  };
};

export const authConfig: AuthConfig = {
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: '1d',
  },
};
