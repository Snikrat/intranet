import { Router } from "express";
import {
  getCurrentMenuService,
  saveCurrentMenuService,
  deleteCurrentMenuService,
} from "../services/menu.service.js";

const menuRoutes = Router();

menuRoutes.get("/menu/current", async (_req, res) => {
  try {
    const menu = await getCurrentMenuService();
    res.json(menu);
  } catch (error) {
    console.error("Erro ao carregar cardápio da semana:", error);
    res.status(500).json({ message: "Erro ao carregar cardápio da semana" });
  }
});

menuRoutes.post("/menu/current", async (req, res) => {
  try {
    const savedMenu = await saveCurrentMenuService(req.body);
    res.json(savedMenu);
  } catch (error) {
    console.error("Erro ao salvar cardápio:", error);

    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Erro ao salvar cardápio" });
  }
});

menuRoutes.delete("/menu/current", async (_req, res) => {
  try {
    await deleteCurrentMenuService();
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao remover cardápio:", error);
    res.status(500).json({ message: "Erro ao remover cardápio" });
  }
});

export { menuRoutes };
