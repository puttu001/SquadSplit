// Extends Express's Request type to include the authenticated user
declare namespace Express {
  interface Request {
    user?: {
      id: string;
      email: string;
    };
  }
}
