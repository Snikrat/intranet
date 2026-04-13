console.log(">>> APP CERTO CARREGADO <<<");
import express from "express";
import cors from "cors";
import { systemsRoutes } from "./routes/systems.routes.js";
import { campaignsRoutes } from "./routes/campaigns.routes.js";
import { popupsRoutes } from "./routes/popups.routes.js";
import { menuRoutes } from "./routes/menu.routes.js";
import { activitiesRoutes } from "./routes/activities.routes.js";
import { trackingRoutes } from "./routes/tracking.routes.js";
import { dashboardRoutes } from "./routes/dashboard.routes.js";
import { uploadsDir } from "./config/multer.js";
import { mediaRoutes } from "./routes/media.routes.js";
import { authRoutes } from "./routes/auth.routes.js";
const app = express();

app.use(
  cors({
    origin: "*",
  }),
);

app.use(express.json());

app.use("/auth", authRoutes);

app.use("/uploads", express.static(uploadsDir));

app.get("/", (_req, res) => {
  res.send("API rodando!");
});

app.use(systemsRoutes);
app.use(campaignsRoutes);
app.use(popupsRoutes);
app.use(menuRoutes);
app.use(activitiesRoutes);
app.use(trackingRoutes);
app.use(dashboardRoutes);
app.use(mediaRoutes);

export { app };
