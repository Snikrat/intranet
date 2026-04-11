import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import multer from "multer";
import { fileURLToPath } from "url";
import { prisma } from "./lib/prisma.js";

const app = express();

app.use(
  cors({
    origin: "*",
  }),
);
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.resolve(__dirname, "../uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "-");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({ storage });

app.use("/uploads", express.static(uploadsDir));

type PopupDisplayType = "modal" | "floating";

type PopupPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "bottom-center";

type CreateOrUpdateSystemBody = {
  title?: string;
  description?: string;
  icon?: string;
  link?: string;
  order?: number;
  active?: boolean;
};

type CreateOrUpdateCampaignBody = {
  title?: string;
  text?: string;
  image?: string;
  order?: number;
  active?: boolean;
};

type CreateOrUpdatePopupBody = {
  title?: string;
  message?: string;
  active?: boolean;
  showOnce?: boolean;
  closeOnlyOnButton?: boolean;
  autoCloseSeconds?: number | null;
  displayType?: PopupDisplayType;
  position?: PopupPosition;
};

type DayKey = "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta";

type DayMenu = {
  items: string;
  isToDefine: boolean;
  isHoliday: boolean;
};

type WeeklyMenuBody = {
  active?: boolean;
  days?: Record<DayKey, DayMenu>;
};

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

function getTimeString(date = new Date()) {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDateString(date = new Date()) {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

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

async function addActivity(text: string) {
  const now = new Date();

  await prisma.activity.create({
    data: {
      text,
      time: getTimeString(now),
      date: getDateString(now),
    },
  });

  const totalActivities = await prisma.activity.count();

  if (totalActivities > 50) {
    const activitiesToDelete = await prisma.activity.findMany({
      orderBy: {
        createdAt: "asc",
      },
      take: totalActivities - 50,
      select: {
        id: true,
      },
    });

    if (activitiesToDelete.length > 0) {
      await prisma.activity.deleteMany({
        where: {
          id: {
            in: activitiesToDelete.map((item) => item.id),
          },
        },
      });
    }
  }
}

app.get("/", (_req, res) => {
  res.send("API rodando 🚀");
});

/* TEST DB */

app.get("/test-db", async (_req, res) => {
  try {
    const systems = await prisma.system.findMany({
      orderBy: { order: "asc" },
    });

    res.json(systems);
  } catch (error) {
    console.error("Erro ao testar banco:", error);
    res.status(500).json({ message: "Erro ao testar banco" });
  }
});

/* MEDIA IMAGES */

app.get("/media/images", async (_req, res) => {
  try {
    const images = await prisma.mediaImage.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(images);
  } catch (error) {
    console.error("Erro ao listar imagens:", error);
    res.status(500).json({ message: "Erro ao listar imagens" });
  }
});

app.post("/media/images", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Nenhuma imagem enviada" });
    }

    const image = await prisma.mediaImage.create({
      data: {
        name: req.file.originalname,
        url: `http://localhost:3000/uploads/${req.file.filename}`,
      },
    });

    res.status(201).json(image);
  } catch (error) {
    console.error("Erro ao enviar imagem:", error);
    res.status(500).json({ message: "Erro ao enviar imagem" });
  }
});

app.delete("/media/images/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const image = await prisma.mediaImage.findUnique({
      where: { id },
    });

    if (!image) {
      return res.status(404).json({ message: "Imagem não encontrada" });
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

    res.status(204).send();
  } catch (error) {
    console.error("Erro ao excluir imagem:", error);
    res.status(500).json({ message: "Erro ao excluir imagem" });
  }
});

/* POPUPS */

app.get("/popups", async (_req, res) => {
  try {
    const popups = await prisma.popup.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(popups);
  } catch (error) {
    console.error("Erro ao listar popups:", error);
    res.status(500).json({ message: "Erro ao listar popups" });
  }
});

app.get("/popups/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const popup = await prisma.popup.findUnique({
      where: { id },
    });

    if (!popup) {
      return res.status(404).json({ message: "Popup não encontrado" });
    }

    res.json(popup);
  } catch (error) {
    console.error("Erro ao buscar popup:", error);
    res.status(500).json({ message: "Erro ao buscar popup" });
  }
});

app.get("/popup/active", async (_req, res) => {
  try {
    const popup = await prisma.popup.findFirst({
      where: {
        active: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    if (!popup) {
      return res.json(null);
    }

    res.json(popup);
  } catch (error) {
    console.error("Erro ao buscar popup ativo:", error);
    res.status(500).json({ message: "Erro ao buscar popup ativo" });
  }
});

app.post("/popups", async (req, res) => {
  try {
    const {
      title,
      message,
      active,
      showOnce,
      closeOnlyOnButton,
      autoCloseSeconds,
      displayType,
      position,
    } = req.body as CreateOrUpdatePopupBody;

    if (!title?.trim() || !message?.trim()) {
      return res.status(400).json({
        message: "Título e mensagem são obrigatórios",
      });
    }

    if (
      autoCloseSeconds !== null &&
      autoCloseSeconds !== undefined &&
      (Number.isNaN(Number(autoCloseSeconds)) || Number(autoCloseSeconds) < 1)
    ) {
      return res.status(400).json({
        message: "Tempo de exibição inválido",
      });
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

    await addActivity(`Popup '${newPopup.title}' criado`);

    res.status(201).json(newPopup);
  } catch (error) {
    console.error("Erro ao criar popup:", error);
    res.status(500).json({ message: "Erro ao criar popup" });
  }
});

app.put("/popups/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const currentPopup = await prisma.popup.findUnique({
      where: { id },
    });

    if (!currentPopup) {
      return res.status(404).json({ message: "Popup não encontrado" });
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
    } = req.body as CreateOrUpdatePopupBody;

    if (title !== undefined && !title.trim()) {
      return res.status(400).json({
        message: "Título é obrigatório",
      });
    }

    if (message !== undefined && !message.trim()) {
      return res.status(400).json({
        message: "Mensagem é obrigatória",
      });
    }

    if (
      autoCloseSeconds !== null &&
      autoCloseSeconds !== undefined &&
      (Number.isNaN(Number(autoCloseSeconds)) || Number(autoCloseSeconds) < 1)
    ) {
      return res.status(400).json({
        message: "Tempo de exibição inválido",
      });
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
      await addActivity(`Popup '${updatedPopup.title}' desativado`);
    } else if (!currentPopup.active && updatedPopup.active) {
      await addActivity(`Popup '${updatedPopup.title}' ativado`);
    } else {
      await addActivity(`Popup '${updatedPopup.title}' atualizado`);
    }

    res.json(updatedPopup);
  } catch (error) {
    console.error("Erro ao atualizar popup:", error);
    res.status(500).json({ message: "Erro ao atualizar popup" });
  }
});

app.delete("/popups/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const popupToDelete = await prisma.popup.findUnique({
      where: { id },
    });

    if (!popupToDelete) {
      return res.status(404).json({ message: "Popup não encontrado" });
    }

    await prisma.popup.delete({
      where: { id },
    });

    await addActivity(`Popup '${popupToDelete.title}' removido`);

    res.status(204).send();
  } catch (error) {
    console.error("Erro ao remover popup:", error);
    res.status(500).json({ message: "Erro ao remover popup" });
  }
});

/* SYSTEMS */

app.get("/systems", async (_req, res) => {
  try {
    const systems = await prisma.system.findMany({
      orderBy: { order: "asc" },
    });

    res.json(systems);
  } catch (error) {
    console.error("Erro ao listar sistemas:", error);
    res.status(500).json({ message: "Erro ao listar sistemas" });
  }
});

app.post("/systems", async (req, res) => {
  try {
    const { title, description, icon, link, order, active } =
      req.body as CreateOrUpdateSystemBody;

    if (!title?.trim() || !description?.trim()) {
      return res
        .status(400)
        .json({ message: "Título e descrição são obrigatórios" });
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

    await addActivity(`Sistema '${newSystem.title}' criado`);

    res.status(201).json(newSystem);
  } catch (error) {
    console.error("Erro ao criar sistema:", error);
    res.status(500).json({ message: "Erro ao criar sistema" });
  }
});

app.put("/systems/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const currentSystem = await prisma.system.findUnique({
      where: { id },
    });

    if (!currentSystem) {
      return res.status(404).json({ message: "Sistema não encontrado" });
    }

    const { title, description, icon, link, order, active } =
      req.body as CreateOrUpdateSystemBody;

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
      await addActivity(`Sistema '${updatedSystem.title}' desativado`);
    } else if (!currentSystem.active && updatedSystem.active) {
      await addActivity(`Sistema '${updatedSystem.title}' ativado`);
    } else {
      await addActivity(`Sistema '${updatedSystem.title}' atualizado`);
    }

    res.json(updatedSystem);
  } catch (error) {
    console.error("Erro ao atualizar sistema:", error);
    res.status(500).json({ message: "Erro ao atualizar sistema" });
  }
});

app.delete("/systems/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const systemToDelete = await prisma.system.findUnique({
      where: { id },
    });

    if (!systemToDelete) {
      return res.status(404).json({ message: "Sistema não encontrado" });
    }

    await prisma.system.delete({
      where: { id },
    });

    await addActivity(`Sistema '${systemToDelete.title}' removido`);

    res.status(204).send();
  } catch (error) {
    console.error("Erro ao remover sistema:", error);
    res.status(500).json({ message: "Erro ao remover sistema" });
  }
});

/* CAMPAIGNS */

app.get("/campaigns", async (_req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { order: "asc" },
    });

    res.json(campaigns);
  } catch (error) {
    console.error("Erro ao listar campanhas:", error);
    res.status(500).json({ message: "Erro ao listar campanhas" });
  }
});

app.post("/campaigns", async (req, res) => {
  try {
    const { title, text, image, order, active } =
      req.body as CreateOrUpdateCampaignBody;

    if (!title?.trim() || !text?.trim() || !image?.trim()) {
      return res.status(400).json({
        message: "Título, texto e imagem são obrigatórios",
      });
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

    await addActivity(`Campanha '${newCampaign.title}' criada`);

    res.status(201).json(newCampaign);
  } catch (error) {
    console.error("Erro ao criar campanha:", error);
    res.status(500).json({ message: "Erro ao criar campanha" });
  }
});

app.put("/campaigns/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const currentCampaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!currentCampaign) {
      return res.status(404).json({ message: "Campanha não encontrada" });
    }

    const { title, text, image, order, active } =
      req.body as CreateOrUpdateCampaignBody;

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
      await addActivity(`Campanha '${updatedCampaign.title}' desativada`);
    } else if (!currentCampaign.active && updatedCampaign.active) {
      await addActivity(`Campanha '${updatedCampaign.title}' ativada`);
    } else {
      await addActivity(`Campanha '${updatedCampaign.title}' editada`);
    }

    res.json(updatedCampaign);
  } catch (error) {
    console.error("Erro ao atualizar campanha:", error);
    res.status(500).json({ message: "Erro ao atualizar campanha" });
  }
});

app.delete("/campaigns/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const campaignToDelete = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaignToDelete) {
      return res.status(404).json({ message: "Campanha não encontrada" });
    }

    await prisma.campaign.delete({
      where: { id },
    });

    await addActivity(`Campanha '${campaignToDelete.title}' removida`);

    res.status(204).send();
  } catch (error) {
    console.error("Erro ao remover campanha:", error);
    res.status(500).json({ message: "Erro ao remover campanha" });
  }
});

/* MENU */

app.get("/menu/current", async (_req, res) => {
  try {
    if (isSunday()) {
      return res.json(emptyWeeklyMenu);
    }

    const menu = await prisma.weeklyMenu.findUnique({
      where: {
        id: 1,
      },
    });

    if (!menu) {
      return res.json(emptyWeeklyMenu);
    }

    res.json(buildWeeklyMenuResponse(menu));
  } catch (error) {
    console.error("Erro ao carregar cardápio da semana:", error);
    res.status(500).json({ message: "Erro ao carregar cardápio da semana" });
  }
});

app.post("/menu/current", async (req, res) => {
  try {
    const body = req.body as WeeklyMenuBody;

    if (!body.days) {
      return res.status(400).json({ message: "Dias do cardápio não enviados" });
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

    await addActivity("Cardápio atualizado");

    res.json(buildWeeklyMenuResponse(savedMenu));
  } catch (error) {
    console.error("Erro ao salvar cardápio:", error);
    res.status(500).json({ message: "Erro ao salvar cardápio" });
  }
});

app.delete("/menu/current", async (_req, res) => {
  try {
    await prisma.weeklyMenu.deleteMany({});

    await addActivity("Cardápio removido");

    res.status(204).send();
  } catch (error) {
    console.error("Erro ao remover cardápio:", error);
    res.status(500).json({ message: "Erro ao remover cardápio" });
  }
});

/* ACTIVITIES */

app.get("/activities", async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 5, 1);

    const totalItems = await prisma.activity.count();
    const totalPages = Math.max(Math.ceil(totalItems / limit), 1);
    const currentPage = Math.min(page, totalPages);

    const items = await prisma.activity.findMany({
      orderBy: {
        createdAt: "desc",
      },
      skip: (currentPage - 1) * limit,
      take: limit,
    });

    res.json({
      items,
      pagination: {
        page: currentPage,
        limit,
        totalItems,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },
    });
  } catch (error) {
    console.error("Erro ao listar atividades:", error);
    res.status(500).json({ message: "Erro ao listar atividades" });
  }
});

/* TRACKING */

app.post("/track/page-view", async (req, res) => {
  try {
    const { page } = req.body as { page?: string };

    if (!page?.trim()) {
      return res.status(400).json({ message: "Página não informada" });
    }

    await prisma.pageView.create({
      data: {
        page: page.trim(),
      },
    });

    res.sendStatus(200);
  } catch (error) {
    console.error("Erro ao rastrear página:", error);
    res.status(500).json({ message: "Erro ao rastrear página" });
  }
});

app.post("/track/system-click", async (req, res) => {
  try {
    const { systemName } = req.body as { systemName?: string };

    if (!systemName?.trim()) {
      return res.status(400).json({ message: "Nome do sistema não informado" });
    }

    await prisma.systemClick.create({
      data: {
        systemName: systemName.trim(),
      },
    });

    res.sendStatus(200);
  } catch (error) {
    console.error("Erro ao rastrear clique no sistema:", error);
    res.status(500).json({ message: "Erro ao rastrear clique no sistema" });
  }
});

/* DASHBOARD */

app.get("/dashboard/summary", async (_req, res) => {
  try {
    const [activeSystems, activeCampaigns, activePopup] = await Promise.all([
      prisma.system.count({
        where: { active: true },
      }),
      prisma.campaign.count({
        where: { active: true },
      }),
      prisma.popup.count({
        where: { active: true },
      }),
    ]);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const [accessesToday, accessesWeek] = await Promise.all([
      prisma.pageView.count({
        where: {
          createdAt: {
            gte: todayStart,
          },
        },
      }),
      prisma.pageView.count({
        where: {
          createdAt: {
            gte: weekStart,
          },
        },
      }),
    ]);

    const pageViews = await prisma.pageView.groupBy({
      by: ["page"],
      _count: {
        page: true,
      },
      orderBy: {
        _count: {
          page: "desc",
        },
      },
      take: 1,
    });

    const systemClicks = await prisma.systemClick.groupBy({
      by: ["systemName"],
      _count: {
        systemName: true,
      },
      orderBy: {
        _count: {
          systemName: "desc",
        },
      },
      take: 1,
    });

    const mostVisitedPage = pageViews[0]
      ? {
          name: pageViews[0].page,
          count: pageViews[0]._count.page,
        }
      : {
          name: "Nenhuma",
          count: 0,
        };

    const mostClickedSystem = systemClicks[0]
      ? {
          name: systemClicks[0].systemName,
          count: systemClicks[0]._count.systemName,
        }
      : {
          name: "Nenhum",
          count: 0,
        };

    res.json({
      activeSystems,
      activeCampaigns,
      activePopup,
      accessesToday,
      accessesWeek,
      mostVisitedPage,
      mostClickedSystem,
    });
  } catch (error) {
    console.error("Erro ao carregar resumo do dashboard:", error);
    res.status(500).json({ message: "Erro ao carregar resumo do dashboard" });
  }
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
