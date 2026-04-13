import { Prisma } from "@prisma/client";

type ReorderItemInput = {
  id: number;
  order: number;
};

export async function applyReorder(
  tx: Prisma.TransactionClient,
  model: {
    update: (args: {
      where: { id: number };
      data: { order: number };
    }) => Promise<unknown>;
  },
  items: ReorderItemInput[],
) {
  for (const item of items) {
    await model.update({
      where: { id: item.id },
      data: { order: item.order },
    });
  }
}
