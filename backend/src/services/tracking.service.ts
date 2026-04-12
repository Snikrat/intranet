import { prisma } from "../lib/prisma.js";

export async function trackPageViewService(page?: string) {
  if (!page?.trim()) {
    throw new Error("Página não informada");
  }

  await prisma.pageView.create({
    data: {
      page: page.trim(),
    },
  });
}

export async function trackSystemClickService(systemName?: string) {
  if (!systemName?.trim()) {
    throw new Error("Nome do sistema não informado");
  }

  await prisma.systemClick.create({
    data: {
      systemName: systemName.trim(),
    },
  });
}
