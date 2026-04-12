import { prisma } from "../lib/prisma.js";

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

export async function addActivityService(text: string) {
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
