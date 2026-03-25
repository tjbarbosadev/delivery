import type { SignOptions } from 'jsonwebtoken';

type AuthConfig = {
  jwt: {
    secret: string | undefined;
    expiresIn: SignOptions['expiresIn'];
  };
};

export const authConfig: AuthConfig = {
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '1d',
  },
};
