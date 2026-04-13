import { useRef } from "react";
import { Bold, CornerDownLeft, Eye, Link as LinkIcon } from "lucide-react";
import { Button } from "../../../../components/Button";
import { Modal } from "../../../../components/Modal";
import styles from "./styles.module.css";
import {
  CustomSelect,
  type CustomSelectOption,
} from "../../../../../../components/CustomSelect";

type PopupDisplayType = "modal" | "floating";

type PopupPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "bottom-center";

type PopupFormData = {
  title: string;
  message: string;
  active: boolean;
  showOnce: boolean;
  closeOnlyOnButton: boolean;
  autoCloseSeconds: string;
  displayType: PopupDisplayType;
  position: PopupPosition;
};

type PopupFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onDelete?: () => void;
  onClear: () => void;
  onPreview: () => void;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onDisplayTypeChange: (value: string) => void;
  onPositionChange: (value: string) => void;
  isEditing: boolean;
  canDelete: boolean;
  saving: boolean;
  form: PopupFormData;
  displayTypeOptions: CustomSelectOption[];
  positionOptions: CustomSelectOption[];
};

export function PopupFormModal({
  open,
  onClose,
  onSubmit,
  onDelete,
  onClear,
  onPreview,
  onChange,
  onDisplayTypeChange,
  onPositionChange,
  isEditing,
  canDelete,
  saving,
  form,
  displayTypeOptions,
  positionOptions,
}: PopupFormModalProps) {
  const messageRef = useRef<HTMLTextAreaElement | null>(null);

  function updateMessageWithSelection(
    before: string,
    after = "",
    placeholder = "texto",
  ) {
    const textarea = messageRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = form.message;
    const selectedText = currentValue.slice(start, end) || placeholder;

    const newValue =
      currentValue.slice(0, start) +
      before +
      selectedText +
      after +
      currentValue.slice(end);

    const syntheticEvent = {
      target: {
        name: "message",
        value: newValue,
        type: "textarea",
      },
    } as React.ChangeEvent<HTMLTextAreaElement>;

    onChange(syntheticEvent);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursorStart = start + before.length;
      const cursorEnd = cursorStart + selectedText.length;
      textarea.setSelectionRange(cursorStart, cursorEnd);
    });
  }

  function insertAtCursor(text: string) {
    const textarea = messageRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = form.message;

    const newValue =
      currentValue.slice(0, start) + text + currentValue.slice(end);

    const syntheticEvent = {
      target: {
        name: "message",
        value: newValue,
        type: "textarea",
      },
    } as React.ChangeEvent<HTMLTextAreaElement>;

    onChange(syntheticEvent);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + text.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  function handleBold() {
    updateMessageWithSelection("<strong>", "</strong>");
  }

  function handleBreakLine() {
    insertAtCursor("<br />");
  }

  function handleLink() {
    const url = window.prompt("Digite o link:");
    if (!url) return;

    updateMessageWithSelection(
      `<a href="${url}" target="_blank" rel="noopener noreferrer">`,
      "</a>",
      "clique aqui",
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar popup" : "Novo popup"}
      subtitle="Configure o popup antes de salvar."
      size="xl"
      footer={
        <div className={styles.footerBar}>
          <div className={styles.footerLeft}>
            {canDelete && onDelete && (
              <Button variant="dangerSoft" onClick={onDelete}>
                Excluir
              </Button>
            )}
          </div>

          <div className={styles.footerRight}>
            <Button variant="secondary" onClick={onClear}>
              Limpar
            </Button>

            <Button variant="secondary" onClick={onPreview}>
              <Eye size={16} />
              Ver prévia
            </Button>

            <Button
              variant="primary"
              type="submit"
              form="popup-form"
              disabled={saving}
            >
              {saving ? "Salvando..." : "Salvar popup"}
            </Button>
          </div>
        </div>
      }
    >
      <form id="popup-form" onSubmit={onSubmit} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="popup-title">
            Título *
          </label>
          <input
            id="popup-title"
            type="text"
            name="title"
            value={form.title}
            onChange={onChange}
            className={styles.input}
            placeholder="Digite o título do popup"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="popup-message">
            Texto *
          </label>

          <div className={styles.editorToolbar}>
            <button
              type="button"
              className={styles.editorButton}
              onClick={handleBold}
              title="Negrito"
            >
              <Bold size={16} />
              Negrito
            </button>

            <button
              type="button"
              className={styles.editorButton}
              onClick={handleBreakLine}
              title="Quebra de linha"
            >
              <CornerDownLeft size={16} />
              Linha
            </button>

            <button
              type="button"
              className={styles.editorButton}
              onClick={handleLink}
              title="Inserir link"
            >
              <LinkIcon size={16} />
              Link
            </button>
          </div>

          <textarea
            id="popup-message"
            ref={messageRef}
            name="message"
            value={form.message}
            onChange={onChange}
            className={styles.textarea}
            placeholder="Digite a mensagem do popup"
            rows={7}
          />

          <span className={styles.editorHint}>
            Você pode usar negrito, quebra de linha e links.
          </span>
        </div>

        <div className={styles.formGrid}>
          <CustomSelect
            id="popup-display-type"
            label="Tipo de exibição"
            value={form.displayType}
            options={displayTypeOptions}
            onChange={onDisplayTypeChange}
          />

          <CustomSelect
            id="popup-position"
            label="Posição"
            value={form.position}
            options={positionOptions}
            disabled={form.displayType === "modal"}
            onChange={onPositionChange}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="popup-auto-close">
            Tempo na tela (segundos)
          </label>
          <input
            id="popup-auto-close"
            type="number"
            min="1"
            name="autoCloseSeconds"
            value={form.autoCloseSeconds}
            onChange={onChange}
            className={styles.input}
            placeholder="Ex.: 5"
            disabled={form.closeOnlyOnButton}
          />
        </div>

        <div className={styles.checkboxRow}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={onChange}
            />
            Popup ativo
          </label>

          <label className={styles.checkbox}>
            <input
              type="checkbox"
              name="showOnce"
              checked={form.showOnce}
              onChange={onChange}
            />
            Exibição única
          </label>

          <label className={styles.checkbox}>
            <input
              type="checkbox"
              name="closeOnlyOnButton"
              checked={form.closeOnlyOnButton}
              onChange={onChange}
            />
            Só sai ao clicar em fechar
          </label>
        </div>
      </form>
    </Modal>
  );
}
