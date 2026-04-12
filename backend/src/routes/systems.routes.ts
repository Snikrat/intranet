import { Router } from "express";
import {
  getSystemsService,
  createSystemService,
  updateSystemService,
  deleteSystemService,
} from "../services/systems.service.js";

const systemsRoutes = Router();

systemsRoutes.get("/systems", async (_req, res) => {
  try {
    const systems = await getSystemsService();
    res.json(systems);
  } catch (error) {
    console.error("Erro ao listar sistemas:", error);
    res.status(500).json({ message: "Erro ao listar sistemas" });
  }
});

systemsRoutes.post("/systems", async (req, res) => {
  try {
    const newSystem = await createSystemService(req.body);
    res.status(201).json(newSystem);
  } catch (error) {
    console.error("Erro ao criar sistema:", error);

    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Erro ao criar sistema" });
  }
});

systemsRoutes.put("/systems/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const updatedSystem = await updateSystemService(id, req.body);
    res.json(updatedSystem);
  } catch (error) {
    console.error("Erro ao atualizar sistema:", error);

    if (error instanceof Error) {
      if (error.message === "Sistema não encontrado") {
        return res.status(404).json({ message: error.message });
      }

      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Erro ao atualizar sistema" });
  }
});

systemsRoutes.delete("/systems/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    await deleteSystemService(id);
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao remover sistema:", error);

    if (error instanceof Error && error.message === "Sistema não encontrado") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: "Erro ao remover sistema" });
  }
});

export { systemsRoutes };
