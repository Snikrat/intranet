import { Router } from "express";
import { ensureAuthenticated } from "../middlewares/auth.middleware.js";
import {
  getSystemsService,
  createSystemService,
  updateSystemService,
  deleteSystemService,
  reorderSystemsService,
} from "../services/systems.service.js";

const systemsRoutes = Router();

systemsRoutes.get("/systems", async (_req, res) => {
  try {
    const systems = await getSystemsService();
    return res.json(systems);
  } catch (error) {
    console.error("Erro ao listar sistemas:", error);
    return res.status(500).json({ message: "Erro ao listar sistemas" });
  }
});

systemsRoutes.post("/systems", ensureAuthenticated, async (req, res) => {
  try {
    const newSystem = await createSystemService(req.body);
    return res.status(201).json(newSystem);
  } catch (error) {
    console.error("Erro ao criar sistema:", error);

    if (error instanceof Error) {
      if (error.message === "ORDER_CONFLICT") {
        return res.status(200).json({
          requiresReorder: true,
          message: "Já existe um sistema nessa posição.",
        });
      }

      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: "Erro ao criar sistema" });
  }
});

systemsRoutes.put("/systems/reorder", ensureAuthenticated, async (req, res) => {
  try {
    await reorderSystemsService(req.body);
    return res.status(200).json({
      message: "Ordem dos sistemas atualizada com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao reordenar sistemas:", error);

    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: "Erro ao reordenar sistemas" });
  }
});

systemsRoutes.put("/systems/:id", ensureAuthenticated, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const updatedSystem = await updateSystemService(id, req.body);
    return res.json(updatedSystem);
  } catch (error) {
    console.error("Erro ao atualizar sistema:", error);

    if (error instanceof Error) {
      if (error.message === "Sistema não encontrado") {
        return res.status(404).json({ message: error.message });
      }

      if (error.message === "ORDER_CONFLICT") {
        return res.status(200).json({
          requiresReorder: true,
          message: "Já existe um sistema nessa posição.",
        });
      }

      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: "Erro ao atualizar sistema" });
  }
});

systemsRoutes.delete("/systems/:id", ensureAuthenticated, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    await deleteSystemService(id);
    return res.status(204).send();
  } catch (error) {
    console.error("Erro ao remover sistema:", error);

    if (error instanceof Error && error.message === "Sistema não encontrado") {
      return res.status(404).json({ message: error.message });
    }

    return res.status(500).json({ message: "Erro ao remover sistema" });
  }
});

export { systemsRoutes };
