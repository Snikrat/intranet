import fs from "fs";
import path from "path";
import { prisma } from "../lib/prisma.js";
import { uploadsDir } from "../config/multer.js";
import { APP_URL } from "../config/env.js";
import { addActivityService } from "./activity.service.js";

export async function getMediaImagesService() {
  return prisma.mediaImage.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function createMediaImageService(file?: Express.Multer.File) {
  if (!file) {
    throw new Error("Nenhuma imagem enviada");
  }

  const image = await prisma.mediaImage.create({
    data: {
      name: file.originalname,
      url: `${APP_URL}/uploads/${file.filename}`,
    },
  });

  await addActivityService(`Imagem '${image.name}' enviada`);

  return image;
}

export async function deleteMediaImageService(id: number) {
  const image = await prisma.mediaImage.findUnique({
    where: { id },
  });

  if (!image) {
    throw new Error("Imagem não encontrada");
  }

  const fileName = image.url.split("/uploads/")[1];

  if (fileName) {
    const filePath = path.resolve(uploadsDir, fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  await prisma.mediaImage.delete({
    where: { id },
  });

  await addActivityService(`Imagem '${image.name}' removida`);

  return image;
}
