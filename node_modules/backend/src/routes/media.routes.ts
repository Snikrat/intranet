import { Router } from "express";
import { ensureAuthenticated } from "../middlewares/auth.middleware.js";
import { upload } from "../config/multer.js";
import {
  getMediaImagesService,
  createMediaImageService,
  deleteMediaImageService,
} from "../services/media.service.js";

const mediaRoutes = Router();

mediaRoutes.get("/media/images", async (_req, res) => {
  try {
    const images = await getMediaImagesService();
    res.json(images);
  } catch (error) {
    console.error("Erro ao listar imagens:", error);
    res.status(500).json({ message: "Erro ao listar imagens" });
  }
});

mediaRoutes.post(
  "/media/images",
  ensureAuthenticated,
  upload.single("image"),
  async (req, res) => {
    try {
      const image = await createMediaImageService(req.file);
      res.status(201).json(image);
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);

      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }

      res.status(500).json({ message: "Erro ao enviar imagem" });
    }
  },
);

mediaRoutes.delete(
  "/media/images/:id",
  ensureAuthenticated,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      await deleteMediaImageService(id);
      res.status(204).send();
    } catch (error) {
      console.error("Erro ao excluir imagem:", error);

      if (error instanceof Error && error.message === "Imagem não encontrada") {
        return res.status(404).json({ message: error.message });
      }

      res.status(500).json({ message: "Erro ao excluir imagem" });
    }
  },
);

export { mediaRoutes };
