import { Router } from "express";
import { ensureAuthenticated } from "../middlewares/auth.middleware.js";
import { getDashboardSummaryService } from "../services/dashboard.service.js";

const dashboardRoutes = Router();

dashboardRoutes.get(
  "/dashboard/summary",
  ensureAuthenticated,
  async (_req, res) => {
    try {
      const summary = await getDashboardSummaryService();
      res.json(summary);
    } catch (error) {
      console.error("Erro ao carregar resumo do dashboard:", error);
      res.status(500).json({ message: "Erro ao carregar resumo do dashboard" });
    }
  },
);

export { dashboardRoutes };
