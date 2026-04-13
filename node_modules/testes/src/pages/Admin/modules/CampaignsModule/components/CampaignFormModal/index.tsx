import { Button } from "../../../../components/Button";
import { Modal } from "../../../../components/Modal";
import styles from "./styles.module.css";

type CampaignFormErrors = {
  title: string;
  text: string;
  image: string;
  order: string;
};

type CampaignFormData = {
  title: string;
  text: string;
  image: string;
  order: number;
  active: boolean;
};

type CampaignFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (event?: React.FormEvent<HTMLFormElement>) => void;
  onDelete?: () => void;
  onClear: () => void;
  onOpenImageLibrary: () => void;
  onChange: <K extends keyof CampaignFormData>(
    field: K,
    value: CampaignFormData[K],
  ) => void;
  isCreating: boolean;
  canDelete: boolean;
  fileName: string;
  formData: CampaignFormData;
  errors: CampaignFormErrors;
  getImagePreviewUrl: (image: string) => string;
};

export function CampaignFormModal({
  open,
  onClose,
  onSubmit,
  onDelete,
  onClear,
  onOpenImageLibrary,
  onChange,
  isCreating,
  canDelete,
  fileName,
  formData,
  errors,
  getImagePreviewUrl,
}: CampaignFormModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isCreating ? "Nova campanha" : "Editar campanha"}
      subtitle="Configure os dados da campanha antes de salvar."
      size="md"
      footer={
        <div className={styles.footerBar}>
          <div className={styles.footerLeft}>
            {canDelete && onDelete && (
              <Button variant="dangerSoft" onClick={onDelete}>
                Excluir campanha
              </Button>
            )}
          </div>

          <div className={styles.footerRight}>
            <Button variant="secondary" onClick={onClear}>
              Limpar
            </Button>

            <Button variant="primary" type="submit" form="campaign-form">
              Salvar campanha
            </Button>
          </div>
        </div>
      }
    >
      <form
        id="campaign-form"
        className={styles.form}
        onSubmit={onSubmit}
        noValidate
      >
        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label className={styles.label}>Título</label>
            {errors.title && (
              <span className={styles.fieldError}>{errors.title}</span>
            )}
          </div>

          <input
            type="text"
            className={`${styles.input} ${errors.title ? styles.inputError : ""}`}
            value={formData.title}
            onChange={(e) => onChange("title", e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label className={styles.label}>Texto</label>
            {errors.text && (
              <span className={styles.fieldError}>{errors.text}</span>
            )}
          </div>

          <textarea
            className={`${styles.textarea} ${errors.text ? styles.inputError : ""}`}
            value={formData.text}
            onChange={(e) => onChange("text", e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label className={styles.label}>Imagem</label>
            {errors.image && (
              <span className={styles.fieldError}>{errors.image}</span>
            )}
          </div>

          <div
            className={`${styles.uploadWrapper} ${
              errors.image ? styles.inputError : ""
            }`}
          >
            <Button variant="secondary" onClick={onOpenImageLibrary}>
              Escolher imagem
            </Button>

            <span className={styles.fileName}>
              {fileName || "Nenhuma imagem selecionada"}
            </span>
          </div>
        </div>

        {formData.image && (
          <img
            src={getImagePreviewUrl(formData.image)}
            alt={formData.title || "Prévia da campanha"}
            className={styles.previewImage}
          />
        )}

        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label className={styles.label}>Posição</label>
            {errors.order && (
              <span className={styles.fieldError}>{errors.order}</span>
            )}
          </div>

          <input
            type="number"
            min={1}
            className={`${styles.input} ${errors.order ? styles.inputError : ""}`}
            value={formData.order}
            onChange={(e) => onChange("order", Number(e.target.value))}
          />
        </div>

        <div className={styles.checkboxRow}>
          <input
            id="active-campaign-modal"
            type="checkbox"
            checked={formData.active}
            onChange={(e) => onChange("active", e.target.checked)}
          />
          <label
            htmlFor="active-campaign-modal"
            className={styles.checkboxLabel}
          >
            Campanha ativa
          </label>
        </div>
      </form>
    </Modal>
  );
}
