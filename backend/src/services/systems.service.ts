import { prisma } from "../lib/prisma.js";
import type { CreateOrUpdateSystemBody } from "../types/system.js";
import { addActivityService } from "./activity.service.js";

export async function getSystemsService() {
  return prisma.system.findMany({
    orderBy: { order: "asc" },
  });
}

export async function createSystemService(body: CreateOrUpdateSystemBody) {
  const { title, description, icon, link, order, active } = body;

  if (!title?.trim() || !description?.trim()) {
    throw new Error("Título e descrição são obrigatórios");
  }

  const nextOrder =
    order ??
    ((
      await prisma.system.aggregate({
        _max: { order: true },
      })
    )._max.order ?? 0) + 1;

  const newSystem = await prisma.system.create({
    data: {
      title: title.trim(),
      description: description.trim(),
      icon: icon || "calendar",
      link: link || "#",
      order: nextOrder,
      active: active ?? true,
    },
  });

  await addActivityService(`Sistema '${newSystem.title}' criado`);

  return newSystem;
}

export async function updateSystemService(
  id: number,
  body: CreateOrUpdateSystemBody,
) {
  const currentSystem = await prisma.system.findUnique({
    where: { id },
  });

  if (!currentSystem) {
    throw new Error("Sistema não encontrado");
  }

  const { title, description, icon, link, order, active } = body;

  const updatedSystem = await prisma.system.update({
    where: { id },
    data: {
      title: title?.trim() ?? currentSystem.title,
      description: description?.trim() ?? currentSystem.description,
      icon: icon ?? currentSystem.icon,
      link: link ?? currentSystem.link,
      order: order ?? currentSystem.order,
      active: active ?? currentSystem.active,
    },
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

  await prisma.system.delete({
    where: { id },
  });

  await addActivityService(`Sistema '${systemToDelete.title}' removido`);

  return systemToDelete;
}
