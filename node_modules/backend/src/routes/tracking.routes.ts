import { Router } from "express";
import {
  trackPageViewService,
  trackSystemClickService,
} from "../services/tracking.service.js";

const trackingRoutes = Router();

trackingRoutes.post("/track/page-view", async (req, res) => {
  try {
    const { page } = req.body as { page?: string };

    await trackPageViewService(page);
    res.sendStatus(200);
  } catch (error) {
    console.error("Erro ao rastrear página:", error);

    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Erro ao rastrear página" });
  }
});

trackingRoutes.post("/track/system-click", async (req, res) => {
  try {
    const { systemName } = req.body as { systemName?: string };

    await trackSystemClickService(systemName);
    res.sendStatus(200);
  } catch (error) {
    console.error("Erro ao rastrear clique no sistema:", error);

    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Erro ao rastrear clique no sistema" });
  }
});

export { trackingRoutes };
