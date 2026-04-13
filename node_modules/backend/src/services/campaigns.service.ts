import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import type { CreateOrUpdateCampaignBody } from "../types/campaign.js";
import { addActivityService } from "./activity.service.js";

type CampaignBodyWithOrderConfirm = CreateOrUpdateCampaignBody & {
  confirmReplaceOrder?: boolean;
};

type ReorderItemInput = {
  id: number;
  order: number;
};

async function normalizeOrders(tx: Prisma.TransactionClient) {
  const campaigns = await tx.campaign.findMany({
    orderBy: [{ order: "asc" }, { id: "asc" }],
  });

  for (let index = 0; index < campaigns.length; index++) {
    const expectedOrder = index + 1;
    const campaign = campaigns[index]!;

    if (campaign.order !== expectedOrder) {
      await tx.campaign.update({
        where: { id: campaign.id },
        data: { order: expectedOrder },
      });
    }
  }
}

export async function getCampaignsService() {
  return prisma.campaign.findMany({
    orderBy: { order: "asc" },
  });
}

export async function createCampaignService(
  body: CampaignBodyWithOrderConfirm,
) {
  const { title, text, image, order, active, confirmReplaceOrder } = body;

  if (!title?.trim() || !text?.trim() || !image?.trim()) {
    throw new Error("Título, texto e imagem são obrigatórios");
  }

  const requestedOrder =
    typeof order === "number" && Number.isFinite(order) && order > 0
      ? Math.floor(order)
      : undefined;

  const newCampaign = await prisma.$transaction(async (tx) => {
    const count = await tx.campaign.count();

    let finalOrder = requestedOrder ?? count + 1;

    if (finalOrder > count + 1) {
      finalOrder = count + 1;
    }

    const conflict = await tx.campaign.findFirst({
      where: { order: finalOrder },
    });

    if (conflict && !confirmReplaceOrder) {
      throw new Error("ORDER_CONFLICT");
    }

    if (conflict && confirmReplaceOrder) {
      await tx.campaign.updateMany({
        where: {
          order: {
            gte: finalOrder,
          },
        },
        data: {
          order: {
            increment: 1,
          },
        },
      });
    }

    const created = await tx.campaign.create({
      data: {
        title: title.trim(),
        text: text.trim(),
        image: image.trim(),
        order: finalOrder,
        active: active ?? true,
      },
    });

    await normalizeOrders(tx);

    return created;
  });

  await addActivityService(`Campanha '${newCampaign.title}' criada`);

  return newCampaign;
}

export async function updateCampaignService(
  id: number,
  body: CampaignBodyWithOrderConfirm,
) {
  const currentCampaign = await prisma.campaign.findUnique({
    where: { id },
  });

  if (!currentCampaign) {
    throw new Error("Campanha não encontrada");
  }

  const { title, text, image, order, active, confirmReplaceOrder } = body;

  const updatedCampaign = await prisma.$transaction(async (tx) => {
    const count = await tx.campaign.count();

    let nextOrder =
      typeof order === "number" && Number.isFinite(order) && order > 0
        ? Math.floor(order)
        : currentCampaign.order;

    if (nextOrder > count) {
      nextOrder = count;
    }

    if (nextOrder < 1) {
      nextOrder = 1;
    }

    if (nextOrder !== currentCampaign.order) {
      const conflict = await tx.campaign.findFirst({
        where: {
          order: nextOrder,
          id: { not: id },
        },
      });

      if (conflict && !confirmReplaceOrder) {
        throw new Error("ORDER_CONFLICT");
      }

      if (confirmReplaceOrder) {
        if (nextOrder < currentCampaign.order) {
          await tx.campaign.updateMany({
            where: {
              id: { not: id },
              order: {
                gte: nextOrder,
                lt: currentCampaign.order,
              },
            },
            data: {
              order: {
                increment: 1,
              },
            },
          });
        } else if (nextOrder > currentCampaign.order) {
          await tx.campaign.updateMany({
            where: {
              id: { not: id },
              order: {
                gt: currentCampaign.order,
                lte: nextOrder,
              },
            },
            data: {
              order: {
                decrement: 1,
              },
            },
          });
        }
      }
    }

    const updated = await tx.campaign.update({
      where: { id },
      data: {
        title: title?.trim() ?? currentCampaign.title,
        text: text?.trim() ?? currentCampaign.text,
        image: image?.trim() ?? currentCampaign.image,
        order: nextOrder,
        active: active ?? currentCampaign.active,
      },
    });

    await normalizeOrders(tx);

    return updated;
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

  await prisma.$transaction(async (tx) => {
    await tx.campaign.delete({
      where: { id },
    });

    await tx.campaign.updateMany({
      where: {
        order: {
          gt: campaignToDelete.order,
        },
      },
      data: {
        order: {
          decrement: 1,
        },
      },
    });

    await normalizeOrders(tx);
  });

  await addActivityService(`Campanha '${campaignToDelete.title}' removida`);

  return campaignToDelete;
}

export async function reorderCampaignsService(items: ReorderItemInput[]) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Lista de reordenação inválida");
  }

  await prisma.$transaction(async (tx) => {
    const campaignIds = items.map((item) => item.id);
    const existingCampaigns = await tx.campaign.findMany({
      where: {
        id: {
          in: campaignIds,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingCampaigns.length !== items.length) {
      throw new Error("Uma ou mais campanhas não foram encontradas");
    }

    for (const item of items) {
      const nextOrder =
        typeof item.order === "number" && Number.isFinite(item.order)
          ? Math.max(1, Math.floor(item.order))
          : 1;

      await tx.campaign.update({
        where: { id: item.id },
        data: { order: nextOrder },
      });
    }

    await normalizeOrders(tx);
  });

  await addActivityService("Ordem das campanhas atualizada");
}
