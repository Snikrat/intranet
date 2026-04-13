import { Router } from "express";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";

export const authRoutes = Router();

authRoutes.post("/login", (req: Request, res: Response) => {
  const { username, password } = req.body;

  const adminUser = process.env.ADMIN_USER;
  const adminPass = process.env.ADMIN_PASS;
  const jwtSecret = process.env.JWT_SECRET;

  if (!adminUser || !adminPass || !jwtSecret) {
    return res.status(500).json({
      message: "Variáveis de ambiente não configuradas",
    });
  }

  if (!username || !password) {
    return res.status(400).json({
      message: "Usuário e senha obrigatórios",
    });
  }

  if (username !== adminUser || password !== adminPass) {
    return res.status(401).json({
      message: "Usuário ou senha inválidos",
    });
  }

  const token = jwt.sign(
    {
      role: "admin",
      username,
    },
    jwtSecret,
    {
      expiresIn: "1d",
    },
  );

  return res.json({
    message: "Login realizado com sucesso",
    token,
  });
});
