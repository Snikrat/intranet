import { prisma } from "../lib/prisma.js";

export async function getDashboardSummaryService() {
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

  return {
    activeSystems,
    activeCampaigns,
    activePopup,
    accessesToday,
    accessesWeek,
    mostVisitedPage,
    mostClickedSystem,
  };
}
