import { Router } from "express";
import { PrismaClient } from "@prisma/client";

import type { WeeklyMenuPayload } from "../types/menu.js";
import { getWeekStart } from "../utils/date.js";

const router = Router();
const prisma = new PrismaClient();

function dbToPayload(menu: any): WeeklyMenuPayload {
  return {
    active: menu.active,
    days: {
      Segunda: {
        items: menu.segundaItems || "",
        isToDefine: menu.segundaToDefine,
        isHoliday: menu.segundaHoliday,
      },
      Terça: {
        items: menu.tercaItems || "",
        isToDefine: menu.tercaToDefine,
        isHoliday: menu.tercaHoliday,
      },
      Quarta: {
        items: menu.quartaItems || "",
        isToDefine: menu.quartaToDefine,
        isHoliday: menu.quartaHoliday,
      },
      Quinta: {
        items: menu.quintaItems || "",
        isToDefine: menu.quintaToDefine,
        isHoliday: menu.quintaHoliday,
      },
      Sexta: {
        items: menu.sextaItems || "",
        isToDefine: menu.sextaToDefine,
        isHoliday: menu.sextaHoliday,
      },
    },
  };
}

router.get("/current", async (_req, res) => {
  try {
    const weekStart = getWeekStart();

    const menu = await prisma.weeklyMenu.findUnique({
      where: { weekStart },
    });

    if (!menu) {
      return res.status(200).json({
        active: true,
        days: {
          Segunda: { items: "", isToDefine: false, isHoliday: false },
          Terça: { items: "", isToDefine: false, isHoliday: false },
          Quarta: { items: "", isToDefine: false, isHoliday: false },
          Quinta: { items: "", isToDefine: false, isHoliday: false },
          Sexta: { items: "", isToDefine: false, isHoliday: false },
        },
      });
    }

    return res.json(dbToPayload(menu));
  } catch (error) {
    console.error("Erro ao buscar cardápio:", error);
    return res.status(500).json({ message: "Erro ao buscar cardápio." });
  }
});

router.post("/current", async (req, res) => {
  try {
    const body = req.body as WeeklyMenuPayload;
    const weekStart = getWeekStart();

    const saved = await prisma.weeklyMenu.upsert({
      where: { weekStart },
      update: {
        active: body.active,

        segundaItems: body.days.Segunda.items,
        segundaToDefine: body.days.Segunda.isToDefine,
        segundaHoliday: body.days.Segunda.isHoliday,

        tercaItems: body.days["Terça"].items,
        tercaToDefine: body.days["Terça"].isToDefine,
        tercaHoliday: body.days["Terça"].isHoliday,

        quartaItems: body.days.Quarta.items,
        quartaToDefine: body.days.Quarta.isToDefine,
        quartaHoliday: body.days.Quarta.isHoliday,

        quintaItems: body.days.Quinta.items,
        quintaToDefine: body.days.Quinta.isToDefine,
        quintaHoliday: body.days.Quinta.isHoliday,

        sextaItems: body.days.Sexta.items,
        sextaToDefine: body.days.Sexta.isToDefine,
        sextaHoliday: body.days.Sexta.isHoliday,
      },
      create: {
        weekStart,
        active: body.active,

        segundaItems: body.days.Segunda.items,
        segundaToDefine: body.days.Segunda.isToDefine,
        segundaHoliday: body.days.Segunda.isHoliday,

        tercaItems: body.days["Terça"].items,
        tercaToDefine: body.days["Terça"].isToDefine,
        tercaHoliday: body.days["Terça"].isHoliday,

        quartaItems: body.days.Quarta.items,
        quartaToDefine: body.days.Quarta.isToDefine,
        quartaHoliday: body.days.Quarta.isHoliday,

        quintaItems: body.days.Quinta.items,
        quintaToDefine: body.days.Quinta.isToDefine,
        quintaHoliday: body.days.Quinta.isHoliday,

        sextaItems: body.days.Sexta.items,
        sextaToDefine: body.days.Sexta.isToDefine,
        sextaHoliday: body.days.Sexta.isHoliday,
      },
    });

    return res.json({
      message: "Cardápio salvo com sucesso.",
      data: dbToPayload(saved),
    });
  } catch (error) {
    console.error("Erro ao salvar cardápio:", error);
    return res.status(500).json({ message: "Erro ao salvar cardápio." });
  }
});

router.delete("/current", async (_req, res) => {
  try {
    const weekStart = getWeekStart();

    await prisma.weeklyMenu.deleteMany({
      where: { weekStart },
    });

    return res.json({ message: "Cardápio removido com sucesso." });
  } catch (error) {
    console.error("Erro ao limpar cardápio:", error);
    return res.status(500).json({ message: "Erro ao limpar cardápio." });
  }
});

export default router;
