declare namespace Express {
  export interface Request {
    user?: {
      role: string;
      username: string;
    };
  }
}
