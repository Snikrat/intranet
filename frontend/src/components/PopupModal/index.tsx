import styles from "./styles.module.css";

type PopupDisplayType = "modal" | "floating";

type PopupPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "bottom-center";

type PopupModalProps = {
  titulo: string;
  mensagem: string;
  onClose: () => void;
  displayType?: PopupDisplayType;
  position?: PopupPosition;
};

export function PopupModal({
  titulo,
  mensagem,
  onClose,
  displayType = "modal",
  position = "top-right",
}: PopupModalProps) {
  const isModal = displayType === "modal";

  function getPositionClass() {
    const map: Record<PopupPosition, string> = {
      "top-left": styles.topLeft,
      "top-right": styles.topRight,
      "bottom-left": styles.bottomLeft,
      "bottom-right": styles.bottomRight,
      "top-center": styles.topCenter,
      "bottom-center": styles.bottomCenter,
    };

    return map[position];
  }

  // MODAL (bloqueia tela)
  if (isModal) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Fechar popup"
          >
            ×
          </button>

          <h2 className={styles.title}>{titulo}</h2>

          <div
            className={styles.message}
            dangerouslySetInnerHTML={{ __html: mensagem }}
          />
        </div>
      </div>
    );
  }

  // FLUTUANTE (não bloqueia tela)
  return (
    <div className={`${styles.floating} ${getPositionClass()}`}>
      <div className={styles.modal}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Fechar popup"
        >
          ×
        </button>

        <h2 className={styles.title}>{titulo}</h2>

        <div
          className={styles.message}
          dangerouslySetInnerHTML={{ __html: mensagem }}
        />
      </div>
    </div>
  );
}
