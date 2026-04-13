import { useEffect, useState } from "react";
import type { ReorderPayload } from "../components/ReorderableList/types";

export function useReorder<T extends { id: number }>(
  sourceItems: T[],
  onSave: (payload: ReorderPayload[]) => Promise<void>,
) {
  const [items, setItems] = useState<T[]>(sourceItems);

  useEffect(() => {
    setItems(sourceItems);
  }, [sourceItems]);

  async function handleChange(newItems: T[]) {
    setItems(newItems);

    const payload: ReorderPayload[] = newItems.map((item, index) => ({
      id: item.id,
      order: index + 1,
    }));

    await onSave(payload);
  }

  return {
    items,
    setItems,
    handleChange,
  };
}
