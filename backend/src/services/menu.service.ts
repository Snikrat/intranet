import { prisma } from "../lib/prisma.js";
import type { DayKey, DayMenu, WeeklyMenuBody } from "../types/menu.js";
import { addActivityService } from "./activity.service.js";

const emptyWeeklyMenu: {
  active: boolean;
  days: Record<DayKey, DayMenu>;
} = {
  active: true,
  days: {
    Segunda: { items: "A definir", isToDefine: true, isHoliday: false },
    Terça: { items: "A definir", isToDefine: true, isHoliday: false },
    Quarta: { items: "A definir", isToDefine: true, isHoliday: false },
    Quinta: { items: "A definir", isToDefine: true, isHoliday: false },
    Sexta: { items: "A definir", isToDefine: true, isHoliday: false },
  },
};

function isSunday(date = new Date()) {
  return date.getDay() === 0;
}

function normalizeDayMenu(day?: Partial<DayMenu>): DayMenu {
  return {
    items: day?.items?.trim() ?? "",
    isToDefine: Boolean(day?.isToDefine),
    isHoliday: Boolean(day?.isHoliday),
  };
}

function buildWeeklyMenuResponse(menu: {
  active: boolean;
  segundaItems: string | null;
  segundaToDefine: boolean;
  segundaHoliday: boolean;
  tercaItems: string | null;
  tercaToDefine: boolean;
  tercaHoliday: boolean;
  quartaItems: string | null;
  quartaToDefine: boolean;
  quartaHoliday: boolean;
  quintaItems: string | null;
  quintaToDefine: boolean;
  quintaHoliday: boolean;
  sextaItems: string | null;
  sextaToDefine: boolean;
  sextaHoliday: boolean;
}) {
  return {
    active: menu.active,
    days: {
      Segunda: {
        items: menu.segundaItems ?? "",
        isToDefine: menu.segundaToDefine,
        isHoliday: menu.segundaHoliday,
      },
      Terça: {
        items: menu.tercaItems ?? "",
        isToDefine: menu.tercaToDefine,
        isHoliday: menu.tercaHoliday,
      },
      Quarta: {
        items: menu.quartaItems ?? "",
        isToDefine: menu.quartaToDefine,
        isHoliday: menu.quartaHoliday,
      },
      Quinta: {
        items: menu.quintaItems ?? "",
        isToDefine: menu.quintaToDefine,
        isHoliday: menu.quintaHoliday,
      },
      Sexta: {
        items: menu.sextaItems ?? "",
        isToDefine: menu.sextaToDefine,
        isHoliday: menu.sextaHoliday,
      },
    },
  };
}

export async function getCurrentMenuService() {
  if (isSunday()) {
    return emptyWeeklyMenu;
  }

  const menu = await prisma.weeklyMenu.findUnique({
    where: {
      id: 1,
    },
  });

  if (!menu) {
    return emptyWeeklyMenu;
  }

  return buildWeeklyMenuResponse(menu);
}

export async function saveCurrentMenuService(body: WeeklyMenuBody) {
  if (!body.days) {
    throw new Error("Dias do cardápio não enviados");
  }

  const normalizedDays: Record<DayKey, DayMenu> = {
    Segunda: normalizeDayMenu(body.days.Segunda),
    Terça: normalizeDayMenu(body.days["Terça"]),
    Quarta: normalizeDayMenu(body.days.Quarta),
    Quinta: normalizeDayMenu(body.days.Quinta),
    Sexta: normalizeDayMenu(body.days.Sexta),
  };

  const savedMenu = await prisma.weeklyMenu.upsert({
    where: {
      id: 1,
    },
    update: {
      active: body.active ?? true,

      segundaItems: normalizedDays.Segunda.items,
      segundaToDefine: normalizedDays.Segunda.isToDefine,
      segundaHoliday: normalizedDays.Segunda.isHoliday,

      tercaItems: normalizedDays["Terça"].items,
      tercaToDefine: normalizedDays["Terça"].isToDefine,
      tercaHoliday: normalizedDays["Terça"].isHoliday,

      quartaItems: normalizedDays.Quarta.items,
      quartaToDefine: normalizedDays.Quarta.isToDefine,
      quartaHoliday: normalizedDays.Quarta.isHoliday,

      quintaItems: normalizedDays.Quinta.items,
      quintaToDefine: normalizedDays.Quinta.isToDefine,
      quintaHoliday: normalizedDays.Quinta.isHoliday,

      sextaItems: normalizedDays.Sexta.items,
      sextaToDefine: normalizedDays.Sexta.isToDefine,
      sextaHoliday: normalizedDays.Sexta.isHoliday,
    },
    create: {
      id: 1,
      weekStart: new Date(),
      active: body.active ?? true,

      segundaItems: normalizedDays.Segunda.items,
      segundaToDefine: normalizedDays.Segunda.isToDefine,
      segundaHoliday: normalizedDays.Segunda.isHoliday,

      tercaItems: normalizedDays["Terça"].items,
      tercaToDefine: normalizedDays["Terça"].isToDefine,
      tercaHoliday: normalizedDays["Terça"].isHoliday,

      quartaItems: normalizedDays.Quarta.items,
      quartaToDefine: normalizedDays.Quarta.isToDefine,
      quartaHoliday: normalizedDays.Quarta.isHoliday,

      quintaItems: normalizedDays.Quinta.items,
      quintaToDefine: normalizedDays.Quinta.isToDefine,
      quintaHoliday: normalizedDays.Quinta.isHoliday,

      sextaItems: normalizedDays.Sexta.items,
      sextaToDefine: normalizedDays.Sexta.isToDefine,
      sextaHoliday: normalizedDays.Sexta.isHoliday,
    },
  });

  await addActivityService("Cardápio atualizado");

  return buildWeeklyMenuResponse(savedMenu);
}

export async function deleteCurrentMenuService() {
  await prisma.weeklyMenu.deleteMany({});
  await addActivityService("Cardápio removido");
}
