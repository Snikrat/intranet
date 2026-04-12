import { prisma } from "../lib/prisma.js";

export async function getActivitiesService(
  pageParam?: string,
  limitParam?: string,
) {
  const page = Math.max(Number(pageParam) || 1, 1);
  const limit = Math.max(Number(limitParam) || 5, 1);

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

  return {
    items,
    pagination: {
      page: currentPage,
      limit,
      totalItems,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    },
  };
}
