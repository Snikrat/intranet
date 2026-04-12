import { Router } from "express";
import {
  getPopupsService,
  getPopupByIdService,
  getActivePopupService,
  createPopupService,
  updatePopupService,
  deletePopupService,
} from "../services/popups.service.js";

const popupsRoutes = Router();

popupsRoutes.get("/popups", async (_req, res) => {
  try {
    const popups = await getPopupsService();
    res.json(popups);
  } catch (error) {
    console.error("Erro ao listar popups:", error);
    res.status(500).json({ message: "Erro ao listar popups" });
  }
});

popupsRoutes.get("/popups/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const popup = await getPopupByIdService(id);
    res.json(popup);
  } catch (error) {
    console.error("Erro ao buscar popup:", error);

    if (error instanceof Error && error.message === "Popup não encontrado") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: "Erro ao buscar popup" });
  }
});

popupsRoutes.get("/popup/active", async (_req, res) => {
  try {
    const popup = await getActivePopupService();

    if (!popup) {
      return res.json(null);
    }

    res.json(popup);
  } catch (error) {
    console.error("Erro ao buscar popup ativo:", error);
    res.status(500).json({ message: "Erro ao buscar popup ativo" });
  }
});

popupsRoutes.post("/popups", async (req, res) => {
  try {
    const newPopup = await createPopupService(req.body);
    res.status(201).json(newPopup);
  } catch (error) {
    console.error("Erro ao criar popup:", error);

    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Erro ao criar popup" });
  }
});

popupsRoutes.put("/popups/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const updatedPopup = await updatePopupService(id, req.body);
    res.json(updatedPopup);
  } catch (error) {
    console.error("Erro ao atualizar popup:", error);

    if (error instanceof Error) {
      if (error.message === "Popup não encontrado") {
        return res.status(404).json({ message: error.message });
      }

      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Erro ao atualizar popup" });
  }
});

popupsRoutes.delete("/popups/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    await deletePopupService(id);
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao remover popup:", error);

    if (error instanceof Error && error.message === "Popup não encontrado") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: "Erro ao remover popup" });
  }
});

export { popupsRoutes };
