import { Router } from "express";
import { ensureAuthenticated } from "../middlewares/auth.middleware.js";
import {
  getCampaignsService,
  createCampaignService,
  updateCampaignService,
  deleteCampaignService,
} from "../services/campaigns.service.js";

const campaignsRoutes = Router();

campaignsRoutes.get("/campaigns", async (_req, res) => {
  try {
    const campaigns = await getCampaignsService();
    res.json(campaigns);
  } catch (error) {
    console.error("Erro ao listar campanhas:", error);
    res.status(500).json({ message: "Erro ao listar campanhas" });
  }
});

campaignsRoutes.post("/campaigns", ensureAuthenticated, async (req, res) => {
  try {
    const newCampaign = await createCampaignService(req.body);
    res.status(201).json(newCampaign);
  } catch (error) {
    console.error("Erro ao criar campanha:", error);

    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Erro ao criar campanha" });
  }
});

campaignsRoutes.put("/campaigns/:id", ensureAuthenticated, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const updatedCampaign = await updateCampaignService(id, req.body);
    res.json(updatedCampaign);
  } catch (error) {
    console.error("Erro ao atualizar campanha:", error);

    if (error instanceof Error) {
      if (error.message === "Campanha não encontrada") {
        return res.status(404).json({ message: error.message });
      }

      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Erro ao atualizar campanha" });
  }
});

campaignsRoutes.delete(
  "/campaigns/:id",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      await deleteCampaignService(id);
      res.status(204).send();
    } catch (error) {
      console.error("Erro ao remover campanha:", error);

      if (
        error instanceof Error &&
        error.message === "Campanha não encontrada"
      ) {
        return res.status(404).json({ message: error.message });
      }

      res.status(500).json({ message: "Erro ao remover campanha" });
    }
  },
);

export { campaignsRoutes };
