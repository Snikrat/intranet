import type { DraggableAttributes } from "@dnd-kit/core";

import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import styles from "./styles.module.css";

type BaseCardProps = {
  children: React.ReactNode;
  className?: string;
};

type SectionProps = {
  children: React.ReactNode;
  className?: string;
};

type StatusBadgeProps = {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
};

type IconActionButtonProps = {
  label: string;
  onClick: () => void;
  variant?: "edit" | "delete";
  children: React.ReactNode;
};

type DragHandleProps = {
  label?: string;
  children?: React.ReactNode;
  className?: string;
  attributes?: DraggableAttributes;
  listeners?: SyntheticListenerMap;
};

type BaseCardComponent = React.FC<BaseCardProps> & {
  Header: React.FC<SectionProps>;
  Body: React.FC<SectionProps>;
  Footer: React.FC<SectionProps>;
  StatusBadge: React.FC<StatusBadgeProps>;
  IconActionButton: React.FC<IconActionButtonProps>;
  DragHandle: React.FC<DragHandleProps>;
};

const BaseCard = (({ children, className }: BaseCardProps) => {
  return <div className={`${styles.card} ${className || ""}`}>{children}</div>;
}) as BaseCardComponent;

function Header({ children, className }: SectionProps) {
  return (
    <div className={`${styles.header} ${className || ""}`}>{children}</div>
  );
}

function Body({ children, className }: SectionProps) {
  return <div className={`${styles.body} ${className || ""}`}>{children}</div>;
}

function Footer({ children, className }: SectionProps) {
  return (
    <div className={`${styles.footer} ${className || ""}`}>{children}</div>
  );
}

function StatusBadge({
  active,
  activeLabel = "Ativo",
  inactiveLabel = "Inativo",
}: StatusBadgeProps) {
  return (
    <span
      className={`${styles.badge} ${
        active ? styles.badgeActive : styles.badgeInactive
      }`}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

function IconActionButton({
  label,
  onClick,
  variant = "edit",
  children,
}: IconActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.iconButton} ${
        variant === "delete" ? styles.iconButtonDelete : styles.iconButtonEdit
      }`}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}

function DragHandle({
  label = "Arrastar para reordenar",
  children,
  className,
  attributes,
  listeners,
}: DragHandleProps) {
  return (
    <button
      type="button"
      className={`${styles.dragHandle} ${className || ""}`}
      aria-label={label}
      title={label}
      {...attributes}
      {...listeners}
    >
      {children}
    </button>
  );
}

BaseCard.Header = Header;
BaseCard.Body = Body;
BaseCard.Footer = Footer;
BaseCard.StatusBadge = StatusBadge;
BaseCard.IconActionButton = IconActionButton;
BaseCard.DragHandle = DragHandle;

export { BaseCard };
