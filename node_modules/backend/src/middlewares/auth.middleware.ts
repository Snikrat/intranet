import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

type JwtPayload = {
  role: string;
  username: string;
};

export function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  const jwtSecret = process.env.JWT_SECRET;

  if (!authHeader) {
    return res.status(401).json({
      message: "Token não informado",
    });
  }

  if (!jwtSecret) {
    return res.status(500).json({
      message: "JWT_SECRET não configurado",
    });
  }

  const [, token] = authHeader.split(" ");

  if (!token) {
    return res.status(401).json({
      message: "Token mal formatado",
    });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    req.user = decoded;

    next();
  } catch {
    return res.status(401).json({
      message: "Token inválido ou expirado",
    });
  }
}
