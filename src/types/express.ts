declare namespace Express {
  interface UserPayload {
    id: string;
    role: 'customer' | 'sale';
  }
  interface Request {
    user: UserPayload;
  }
}
