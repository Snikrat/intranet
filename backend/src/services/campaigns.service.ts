import { prisma } from "../lib/prisma.js";
import type { CreateOrUpdateCampaignBody } from "../types/campaign.js";
import { addActivityService } from "./activity.service.js";

export async function getCampaignsService() {
  return prisma.campaign.findMany({
    orderBy: { order: "asc" },
  });
}

export async function createCampaignService(body: CreateOrUpdateCampaignBody) {
  const { title, text, image, order, active } = body;

  if (!title?.trim() || !text?.trim() || !image?.trim()) {
    throw new Error("Título, texto e imagem são obrigatórios");
  }

  const nextOrder =
    order ??
    ((
      await prisma.campaign.aggregate({
        _max: { order: true },
      })
    )._max.order ?? 0) + 1;

  const newCampaign = await prisma.campaign.create({
    data: {
      title: title.trim(),
      text: text.trim(),
      image: image.trim(),
      order: nextOrder,
      active: active ?? true,
    },
  });

  await addActivityService(`Campanha '${newCampaign.title}' criada`);

  return newCampaign;
}

export async function updateCampaignService(
  id: number,
  body: CreateOrUpdateCampaignBody,
) {
  const currentCampaign = await prisma.campaign.findUnique({
    where: { id },
  });

  if (!currentCampaign) {
    throw new Error("Campanha não encontrada");
  }

  const { title, text, image, order, active } = body;

  const updatedCampaign = await prisma.campaign.update({
    where: { id },
    data: {
      title: title?.trim() ?? currentCampaign.title,
      text: text?.trim() ?? currentCampaign.text,
      image: image?.trim() ?? currentCampaign.image,
      order: order ?? currentCampaign.order,
      active: active ?? currentCampaign.active,
    },
  });

  if (currentCampaign.active && !updatedCampaign.active) {
    await addActivityService(`Campanha '${updatedCampaign.title}' desativada`);
  } else if (!currentCampaign.active && updatedCampaign.active) {
    await addActivityService(`Campanha '${updatedCampaign.title}' ativada`);
  } else {
    await addActivityService(`Campanha '${updatedCampaign.title}' editada`);
  }

  return updatedCampaign;
}

export async function deleteCampaignService(id: number) {
  const campaignToDelete = await prisma.campaign.findUnique({
    where: { id },
  });

  if (!campaignToDelete) {
    throw new Error("Campanha não encontrada");
  }

  await prisma.campaign.delete({
    where: { id },
  });

  await addActivityService(`Campanha '${campaignToDelete.title}' removida`);

  return campaignToDelete;
}
