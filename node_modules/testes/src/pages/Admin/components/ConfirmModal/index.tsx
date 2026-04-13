import { Modal } from "../Modal";
import { Button } from "../Button";
import styles from "./styles.module.css";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  variant?: "default" | "danger";
  confirmText?: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmModal({
  open,
  title,
  message,
  variant = "default",
  confirmText,
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>

          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
          >
            {confirmText || (variant === "danger" ? "Excluir" : "Confirmar")}
          </Button>
        </div>
      }
    >
      <p className={styles.text}>{message}</p>
    </Modal>
  );
}
