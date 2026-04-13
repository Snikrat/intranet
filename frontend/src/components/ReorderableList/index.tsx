import { useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
  DragOverlay,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReorderableItem } from "./types";

type ReorderableListProps<T extends ReorderableItem> = {
  items: T[];
  onChange: (items: T[]) => void | Promise<void>;
  renderItem: (
    item: T,
    options?: {
      dragHandleProps?: {
        attributes: ReturnType<typeof useSortable>["attributes"];
        listeners: ReturnType<typeof useSortable>["listeners"];
      };
      isDragging?: boolean;
      isOverlay?: boolean;
    },
  ) => React.ReactNode;
  className?: string;
  itemClassName?: string;
};

type SortableItemProps<T extends ReorderableItem> = {
  item: T;
  renderItem: ReorderableListProps<T>["renderItem"];
  className?: string;
};

function SortableItem<T extends ReorderableItem>({
  item,
  renderItem,
  className,
}: SortableItemProps<T>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? "transform 220ms ease",
    position: "relative",
    zIndex: isDragging ? 20 : 1,
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={className}>
      {renderItem(item, {
        dragHandleProps: { attributes, listeners },
        isDragging,
        isOverlay: false,
      })}
    </div>
  );
}

export function ReorderableList<T extends ReorderableItem>({
  items,
  onChange,
  renderItem,
  className,
  itemClassName,
}: ReorderableListProps<T>) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const activeItem = useMemo(() => {
    if (activeId === null) {
      return null;
    }

    return items.find((item) => item.id === Number(activeId)) ?? null;
  }, [activeId, items]);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex((item) => item.id === Number(active.id));
    const newIndex = items.findIndex((item) => item.id === Number(over.id));

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    const reorderedItems = arrayMove(items, oldIndex, newIndex);
    void onChange(reorderedItems);
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      modifiers={[restrictToParentElement]}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={rectSortingStrategy}
      >
        <div className={className}>
          {items.map((item) => (
            <SortableItem
              key={item.id}
              item={item}
              renderItem={renderItem}
              className={itemClassName}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={{ duration: 220, easing: "ease" }}>
        {activeItem ? renderItem(activeItem, { isOverlay: true }) : null}
      </DragOverlay>
    </DndContext>
  );
}
