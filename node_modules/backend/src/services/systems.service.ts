import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import type { CreateOrUpdateSystemBody } from "../types/system.js";
import { addActivityService } from "./activity.service.js";

type SystemBodyWithOrderConfirm = CreateOrUpdateSystemBody & {
  confirmReplaceOrder?: boolean;
};

type ReorderItemInput = {
  id: number;
  order: number;
};

async function normalizeOrders(tx: Prisma.TransactionClient) {
  const systems = await tx.system.findMany({
    orderBy: [{ order: "asc" }, { id: "asc" }],
  });

  for (let index = 0; index < systems.length; index++) {
    const expectedOrder = index + 1;
    const system = systems[index]!;

    if (system.order !== expectedOrder) {
      await tx.system.update({
        where: { id: system.id },
        data: { order: expectedOrder },
      });
    }
  }
}

export async function getSystemsService() {
  return prisma.system.findMany({
    orderBy: { order: "asc" },
  });
}

export async function createSystemService(body: SystemBodyWithOrderConfirm) {
  const { title, description, icon, link, order, active, confirmReplaceOrder } =
    body;

  if (!title?.trim() || !description?.trim()) {
    throw new Error("Título e descrição são obrigatórios");
  }

  const requestedOrder =
    typeof order === "number" && Number.isFinite(order) && order > 0
      ? Math.floor(order)
      : undefined;

  const newSystem = await prisma.$transaction(async (tx) => {
    const count = await tx.system.count();

    let finalOrder = requestedOrder ?? count + 1;

    if (finalOrder > count + 1) {
      finalOrder = count + 1;
    }

    const conflict = await tx.system.findFirst({
      where: { order: finalOrder },
    });

    if (conflict && !confirmReplaceOrder) {
      throw new Error("ORDER_CONFLICT");
    }

    if (conflict && confirmReplaceOrder) {
      await tx.system.updateMany({
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

    const created = await tx.system.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        icon: icon || "calendar",
        link: link || "#",
        order: finalOrder,
        active: active ?? true,
      },
    });

    await normalizeOrders(tx);

    return created;
  });

  await addActivityService(`Sistema '${newSystem.title}' criado`);

  return newSystem;
}

export async function updateSystemService(
  id: number,
  body: SystemBodyWithOrderConfirm,
) {
  const currentSystem = await prisma.system.findUnique({
    where: { id },
  });

  if (!currentSystem) {
    throw new Error("Sistema não encontrado");
  }

  const { title, description, icon, link, order, active, confirmReplaceOrder } =
    body;

  const updatedSystem = await prisma.$transaction(async (tx) => {
    const count = await tx.system.count();

    let nextOrder =
      typeof order === "number" && Number.isFinite(order) && order > 0
        ? Math.floor(order)
        : currentSystem.order;

    if (nextOrder > count) {
      nextOrder = count;
    }

    if (nextOrder < 1) {
      nextOrder = 1;
    }

    if (nextOrder !== currentSystem.order) {
      const conflict = await tx.system.findFirst({
        where: {
          order: nextOrder,
          id: { not: id },
        },
      });

      if (conflict && !confirmReplaceOrder) {
        throw new Error("ORDER_CONFLICT");
      }

      if (confirmReplaceOrder) {
        if (nextOrder < currentSystem.order) {
          await tx.system.updateMany({
            where: {
              id: { not: id },
              order: {
                gte: nextOrder,
                lt: currentSystem.order,
              },
            },
            data: {
              order: {
                increment: 1,
              },
            },
          });
        } else if (nextOrder > currentSystem.order) {
          await tx.system.updateMany({
            where: {
              id: { not: id },
              order: {
                gt: currentSystem.order,
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

    const updated = await tx.system.update({
      where: { id },
      data: {
        title: title?.trim() ?? currentSystem.title,
        description: description?.trim() ?? currentSystem.description,
        icon: icon ?? currentSystem.icon,
        link: link ?? currentSystem.link,
        order: nextOrder,
        active: active ?? currentSystem.active,
      },
    });

    await normalizeOrders(tx);

    return updated;
  });

  if (currentSystem.active && !updatedSystem.active) {
    await addActivityService(`Sistema '${updatedSystem.title}' desativado`);
  } else if (!currentSystem.active && updatedSystem.active) {
    await addActivityService(`Sistema '${updatedSystem.title}' ativado`);
  } else {
    await addActivityService(`Sistema '${updatedSystem.title}' atualizado`);
  }

  return updatedSystem;
}

export async function deleteSystemService(id: number) {
  const systemToDelete = await prisma.system.findUnique({
    where: { id },
  });

  if (!systemToDelete) {
    throw new Error("Sistema não encontrado");
  }

  await prisma.$transaction(async (tx) => {
    await tx.system.delete({
      where: { id },
    });

    await tx.system.updateMany({
      where: {
        order: {
          gt: systemToDelete.order,
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

  await addActivityService(`Sistema '${systemToDelete.title}' removido`);

  return systemToDelete;
}

export async function reorderSystemsService(items: ReorderItemInput[]) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Lista de reordenação inválida");
  }

  await prisma.$transaction(async (tx) => {
    const systemIds = items.map((item) => item.id);
    const existingSystems = await tx.system.findMany({
      where: {
        id: {
          in: systemIds,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingSystems.length !== items.length) {
      throw new Error("Um ou mais sistemas não foram encontrados");
    }

    for (const item of items) {
      const nextOrder =
        typeof item.order === "number" && Number.isFinite(item.order)
          ? Math.max(1, Math.floor(item.order))
          : 1;

      await tx.system.update({
        where: { id: item.id },
        data: { order: nextOrder },
      });
    }

    await normalizeOrders(tx);
  });

  await addActivityService("Ordem dos sistemas atualizada");
}
