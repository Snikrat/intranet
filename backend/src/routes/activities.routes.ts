import { Router } from "express";
import { getActivitiesService } from "../services/activities.service.js";

const activitiesRoutes = Router();

activitiesRoutes.get("/activities", async (req, res) => {
  try {
    const result = await getActivitiesService(
      req.query.page as string | undefined,
      req.query.limit as string | undefined,
    );

    res.json(result);
  } catch (error) {
    console.error("Erro ao listar atividades:", error);
    res.status(500).json({ message: "Erro ao listar atividades" });
  }
});

export { activitiesRoutes };
