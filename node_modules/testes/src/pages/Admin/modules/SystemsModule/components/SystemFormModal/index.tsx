import {
  CalendarDays,
  Truck,
  FolderKanban,
  Mail,
  Wrench,
  BarChart3,
  Boxes,
} from "lucide-react";
import { Button } from "../../../../components/Button";
import { Modal } from "../../../../components/Modal";
import styles from "./styles.module.css";

const iconOptions = [
  { value: "calendar", label: "Calendário", icon: CalendarDays },
  { value: "truck", label: "Caminhão", icon: Truck },
  { value: "boxes", label: "Caixas", icon: Boxes },
  { value: "mail", label: "Email", icon: Mail },
  { value: "wrench", label: "Ferramenta", icon: Wrench },
  { value: "chart", label: "Gráfico", icon: BarChart3 },
  { value: "folder", label: "Pasta", icon: FolderKanban },
];

type SystemFormErrors = {
  title: string;
  description: string;
  link: string;
  order: string;
};

type SystemFormData = {
  title: string;
  description: string;
  icon: string;
  link: string;
  order: number;
  active: boolean;
};

type SystemFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (event?: React.FormEvent<HTMLFormElement>) => void;
  onDelete?: () => void;
  onClear: () => void;
  onChange: <K extends keyof SystemFormData>(
    field: K,
    value: SystemFormData[K],
  ) => void;
  isCreating: boolean;
  canDelete: boolean;
  formData: SystemFormData;
  errors: SystemFormErrors;
};

export function SystemFormModal({
  open,
  onClose,
  onSubmit,
  onDelete,
  onClear,
  onChange,
  isCreating,
  canDelete,
  formData,
  errors,
}: SystemFormModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isCreating ? "Novo sistema" : "Editar sistema"}
      subtitle="Configure os dados do card antes de salvar."
      size="lg"
      footer={
        <div className={styles.footerBar}>
          <div className={styles.footerLeft}>
            {canDelete && onDelete && (
              <Button variant="dangerSoft" onClick={onDelete}>
                Excluir sistema
              </Button>
            )}
          </div>

          <div className={styles.footerRight}>
            <Button variant="secondary" onClick={onClear}>
              Limpar
            </Button>

            <Button variant="primary" type="submit" form="system-form">
              Salvar sistema
            </Button>
          </div>
        </div>
      }
    >
      <form
        id="system-form"
        className={styles.form}
        onSubmit={onSubmit}
        noValidate
      >
        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label className={styles.label}>Ícone</label>
          </div>

          <div className={styles.iconPicker}>
            {iconOptions.map((item) => {
              const Icon = item.icon;
              const isSelected = formData.icon === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  className={`${styles.iconOption} ${
                    isSelected ? styles.iconOptionActive : ""
                  }`}
                  onClick={() => onChange("icon", item.value)}
                >
                  <Icon size={22} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

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
            onChange={(event) => onChange("title", event.target.value)}
          />
        </div>

        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label className={styles.label}>Texto</label>
            {errors.description && (
              <span className={styles.fieldError}>{errors.description}</span>
            )}
          </div>

          <textarea
            className={`${styles.textarea} ${
              errors.description ? styles.inputError : ""
            }`}
            value={formData.description}
            onChange={(event) => onChange("description", event.target.value)}
          />
        </div>

        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label className={styles.label}>Link do sistema</label>
            {errors.link && (
              <span className={styles.fieldError}>{errors.link}</span>
            )}
          </div>

          <input
            type="text"
            className={`${styles.input} ${errors.link ? styles.inputError : ""}`}
            value={formData.link}
            onChange={(event) => onChange("link", event.target.value)}
            placeholder="https://... ou /rota"
          />
        </div>

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
            onChange={(event) => onChange("order", Number(event.target.value))}
          />
        </div>

        <div className={styles.checkboxRow}>
          <input
            id="active-system-modal"
            type="checkbox"
            checked={formData.active}
            onChange={(event) => onChange("active", event.target.checked)}
          />
          <label htmlFor="active-system-modal" className={styles.checkboxLabel}>
            Sistema ativo
          </label>
        </div>
      </form>
    </Modal>
  );
}
