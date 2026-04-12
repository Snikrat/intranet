import { prisma } from "../lib/prisma.js";
import type {
  CreateOrUpdatePopupBody,
  PopupDisplayType,
  PopupPosition,
} from "../types/popup.js";
import { addActivityService } from "./activity.service.js";

export async function getPopupsService() {
  return prisma.popup.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getPopupByIdService(id: number) {
  const popup = await prisma.popup.findUnique({
    where: { id },
  });

  if (!popup) {
    throw new Error("Popup não encontrado");
  }

  return popup;
}

export async function getActivePopupService() {
  return prisma.popup.findFirst({
    where: {
      active: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function createPopupService(body: CreateOrUpdatePopupBody) {
  const {
    title,
    message,
    active,
    showOnce,
    closeOnlyOnButton,
    autoCloseSeconds,
    displayType,
    position,
  } = body;

  if (!title?.trim() || !message?.trim()) {
    throw new Error("Título e mensagem são obrigatórios");
  }

  if (
    autoCloseSeconds !== null &&
    autoCloseSeconds !== undefined &&
    (Number.isNaN(Number(autoCloseSeconds)) || Number(autoCloseSeconds) < 1)
  ) {
    throw new Error("Tempo de exibição inválido");
  }

  const normalizedDisplayType: PopupDisplayType =
    displayType === "floating" ? "floating" : "modal";

  const normalizedPosition: PopupPosition = position ?? "top-right";

  const newPopup = await prisma.popup.create({
    data: {
      title: title.trim(),
      message: message.trim(),
      active: active ?? true,
      showOnce: showOnce ?? false,
      closeOnlyOnButton: closeOnlyOnButton ?? false,
      autoCloseSeconds:
        closeOnlyOnButton ||
        autoCloseSeconds === null ||
        autoCloseSeconds === undefined
          ? null
          : Number(autoCloseSeconds),
      displayType: normalizedDisplayType,
      position: normalizedPosition,
    },
  });

  await addActivityService(`Popup '${newPopup.title}' criado`);

  return newPopup;
}

export async function updatePopupService(
  id: number,
  body: CreateOrUpdatePopupBody,
) {
  const currentPopup = await prisma.popup.findUnique({
    where: { id },
  });

  if (!currentPopup) {
    throw new Error("Popup não encontrado");
  }

  const {
    title,
    message,
    active,
    showOnce,
    closeOnlyOnButton,
    autoCloseSeconds,
    displayType,
    position,
  } = body;

  if (title !== undefined && !title.trim()) {
    throw new Error("Título é obrigatório");
  }

  if (message !== undefined && !message.trim()) {
    throw new Error("Mensagem é obrigatória");
  }

  if (
    autoCloseSeconds !== null &&
    autoCloseSeconds !== undefined &&
    (Number.isNaN(Number(autoCloseSeconds)) || Number(autoCloseSeconds) < 1)
  ) {
    throw new Error("Tempo de exibição inválido");
  }

  const nextCloseOnlyOnButton =
    closeOnlyOnButton ?? currentPopup.closeOnlyOnButton;

  const nextDisplayType: PopupDisplayType =
    displayType ?? (currentPopup.displayType as PopupDisplayType) ?? "modal";

  const nextPosition: PopupPosition =
    position ?? (currentPopup.position as PopupPosition) ?? "top-right";

  const updatedPopup = await prisma.popup.update({
    where: { id },
    data: {
      title: title?.trim() ?? currentPopup.title,
      message: message?.trim() ?? currentPopup.message,
      active: active ?? currentPopup.active,
      showOnce: showOnce ?? currentPopup.showOnce,
      closeOnlyOnButton: nextCloseOnlyOnButton,
      autoCloseSeconds: nextCloseOnlyOnButton
        ? null
        : autoCloseSeconds !== undefined
          ? autoCloseSeconds === null
            ? null
            : Number(autoCloseSeconds)
          : currentPopup.autoCloseSeconds,
      displayType: nextDisplayType,
      position: nextPosition,
    },
  });

  if (currentPopup.active && !updatedPopup.active) {
    await addActivityService(`Popup '${updatedPopup.title}' desativado`);
  } else if (!currentPopup.active && updatedPopup.active) {
    await addActivityService(`Popup '${updatedPopup.title}' ativado`);
  } else {
    await addActivityService(`Popup '${updatedPopup.title}' atualizado`);
  }

  return updatedPopup;
}

export async function deletePopupService(id: number) {
  const popupToDelete = await prisma.popup.findUnique({
    where: { id },
  });

  if (!popupToDelete) {
    throw new Error("Popup não encontrado");
  }

  await prisma.popup.delete({
    where: { id },
  });

  await addActivityService(`Popup '${popupToDelete.title}' removido`);

  return popupToDelete;
}
