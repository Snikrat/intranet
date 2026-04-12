import { useEffect, useMemo, useState } from "react";
import DOMPurify from "dompurify";
import { CheckCircle2, CircleOff, Pencil, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import { ConfirmModal } from "../../components/ConfirmModal";
import { PopupFormModal } from "./components/PopupFormModal";
import { AdminLayout } from "../../components/AdminLayout";
import { AdminSectionCard } from "../../components/AdminSectionCard";
import { AdminListItem } from "../../components/AdminListItem";
import { StatusBadge } from "../../components/StatusBadge";
import { IconActionButton } from "../../components/IconActionButton";
import { Pagination } from "../../../../components/Pagination";
import styles from "./styles.module.css";
import type { CustomSelectOption } from "../../../../components/CustomSelect";
import { API_URL } from "../../../../config/env";
import { api } from "../../../../services/api";

type PopupDisplayType = "modal" | "floating";

type PopupPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "bottom-center";

type PopupItem = {
  id: number;
  title: string;
  message: string;
  active: boolean;
  showOnce: boolean;
  closeOnlyOnButton: boolean;
  autoCloseSeconds: number | null;
  displayType: PopupDisplayType;
  position: PopupPosition;
};

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

type ConfirmModalState = {
  open: boolean;
  action: "delete" | null;
  title: string;
  message: string;
};

const initialForm: PopupFormData = {
  title: "",
  message: "",
  active: true,
  showOnce: false,
  closeOnlyOnButton: false,
  autoCloseSeconds: "",
  displayType: "modal",
  position: "top-right",
};

const ITEMS_PER_PAGE = 5;

export function PopupModule() {
  const [popups, setPopups] = useState<PopupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PopupFormData>(initialForm);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [page, setPage] = useState(1);

  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    open: false,
    action: null,
    title: "",
    message: "",
  });

  const displayTypeOptions: CustomSelectOption[] = [
    { value: "modal", label: "Modal" },
    { value: "floating", label: "Flutuante" },
  ];

  const positionOptions: CustomSelectOption[] = [
    { value: "top-left", label: "Superior esquerda" },
    { value: "top-right", label: "Superior direita" },
    { value: "bottom-left", label: "Inferior esquerda" },
    { value: "bottom-right", label: "Inferior direita" },
    { value: "top-center", label: "Superior central" },
    { value: "bottom-center", label: "Inferior central" },
  ];

  useEffect(() => {
    void fetchPopups();
  }, []);

  async function fetchPopups() {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/popups`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao carregar popups");
      }

      const normalizedData = Array.isArray(data) ? data : [];
      setPopups(normalizedData);

      const totalPages = Math.max(
        1,
        Math.ceil(normalizedData.length / ITEMS_PER_PAGE),
      );
      setPage((current) => Math.min(current, totalPages));
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar popups");
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingId(null);
    setForm(initialForm);
    setIsPreviewOpen(false);
    setIsModalOpen(true);
  }

  function openEditModal(popup: PopupItem) {
    setEditingId(popup.id);
    setForm({
      title: popup.title,
      message: popup.message,
      active: popup.active,
      showOnce: popup.showOnce,
      closeOnlyOnButton: popup.closeOnlyOnButton,
      autoCloseSeconds:
        popup.autoCloseSeconds !== null ? String(popup.autoCloseSeconds) : "",
      displayType: popup.displayType ?? "modal",
      position: popup.position ?? "top-right",
    });
    setIsPreviewOpen(false);
    setIsModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setIsPreviewOpen(false);
    setIsModalOpen(false);
    setEditingId(null);
    setForm(initialForm);
  }

  function openPreview() {
    if (!form.title.trim()) {
      toast.warning("Preencha pelo menos o título para visualizar a prévia");
      return;
    }

    if (!form.message.trim()) {
      toast.warning("Preencha o texto para visualizar a prévia");
      return;
    }

    setIsPreviewOpen(true);
  }

  function closePreview() {
    setIsPreviewOpen(false);
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setForm((prev) => {
      const next = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "closeOnlyOnButton" && checked) {
        next.autoCloseSeconds = "";
      }

      return next;
    });
  }

  function handleDisplayTypeChange(value: string) {
    setForm((prev) => ({
      ...prev,
      displayType: value as PopupDisplayType,
      position: value === "modal" ? "top-right" : prev.position,
    }));
  }

  function handlePositionChange(value: string) {
    setForm((prev) => ({
      ...prev,
      position: value as PopupPosition,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.warning("O título é obrigatório");
      return;
    }

    if (!form.message.trim()) {
      toast.warning("O texto do popup é obrigatório");
      return;
    }

    const autoCloseSeconds =
      form.autoCloseSeconds.trim() === ""
        ? null
        : Number(form.autoCloseSeconds);

    if (
      autoCloseSeconds !== null &&
      (Number.isNaN(autoCloseSeconds) || autoCloseSeconds < 1)
    ) {
      toast.warning("O tempo de exibição deve ser maior que 0");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: form.title.trim(),
        message: form.message.trim(),
        active: form.active,
        showOnce: form.showOnce,
        closeOnlyOnButton: form.closeOnlyOnButton,
        autoCloseSeconds: form.closeOnlyOnButton ? null : autoCloseSeconds,
        displayType: form.displayType,
        position: form.position,
      };

      const isEditing = editingId !== null;

      if (isEditing) {
        await api.put(`/popups/${editingId}`, payload);
      } else {
        await api.post("/popups", payload);
      }

      toast.success(
        isEditing
          ? "Popup atualizado com sucesso!"
          : "Popup criado com sucesso!",
      );

      closeModal();
      await fetchPopups();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar popup");
    } finally {
      setSaving(false);
    }
  }

  function openDeleteConfirm(id: number) {
    setConfirmModal({
      open: true,
      action: "delete",
      title: "Excluir popup",
      message: "Deseja excluir este popup?",
    });

    setEditingId(id);
  }

  function closeConfirmModal() {
    setConfirmModal({
      open: false,
      action: null,
      title: "",
      message: "",
    });
  }

  async function handleDeleteConfirmed() {
    if (editingId === null) return;

    try {
      await api.delete(`/popups/${editingId}`);

      toast.success("Popup excluído com sucesso!");

      if (isModalOpen) {
        closeModal();
      }

      closeConfirmModal();
      await fetchPopups();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir popup");
      closeConfirmModal();
    }
  }

  const totalPages = Math.max(1, Math.ceil(popups.length / ITEMS_PER_PAGE));

  const paginatedPopups = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return popups.slice(start, end);
  }, [popups, page]);

  function getPositionLabel(position: PopupPosition) {
    const labels: Record<PopupPosition, string> = {
      "top-left": "Superior esquerda",
      "top-right": "Superior direita",
      "bottom-left": "Inferior esquerda",
      "bottom-right": "Inferior direita",
      "top-center": "Superior central",
      "bottom-center": "Inferior central",
    };

    return labels[position];
  }

  function getPreviewPositionClass(position: PopupPosition) {
    const map: Record<PopupPosition, string> = {
      "top-left": styles.previewTopLeft,
      "top-right": styles.previewTopRight,
      "bottom-left": styles.previewBottomLeft,
      "bottom-right": styles.previewBottomRight,
      "top-center": styles.previewTopCenter,
      "bottom-center": styles.previewBottomCenter,
    };

    return map[position];
  }

  return (
    <AdminLayout
      title="Gerenciar popups"
      subtitle="Crie, edite e controle os popups exibidos na home."
      buttonText="Novo popup"
      onNew={openCreateModal}
    >
      <>
        <AdminSectionCard
          title="Popups cadastrados"
          footer={
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          }
        >
          {loading ? (
            <p className={styles.emptyText}>Carregando popups...</p>
          ) : paginatedPopups.length === 0 ? (
            <p className={styles.emptyText}>Nenhum popup cadastrado.</p>
          ) : (
            paginatedPopups.map((popup) => (
              <AdminListItem
                key={popup.id}
                title={popup.title}
                description={`${
                  popup.displayType === "modal"
                    ? "modal"
                    : `flutuante • ${getPositionLabel(
                        popup.position ?? "top-right",
                      )}`
                } • ${
                  popup.showOnce ? "exibição única" : "exibição normal"
                } • ${
                  popup.closeOnlyOnButton
                    ? "fecha só no X"
                    : popup.autoCloseSeconds
                      ? `${popup.autoCloseSeconds}s na tela`
                      : "sem tempo automático"
                }`}
                icon={
                  popup.active ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <CircleOff size={18} />
                  )
                }
                status={<StatusBadge active={popup.active} />}
                actions={
                  <>
                    <IconActionButton
                      label="Editar popup"
                      variant="edit"
                      onClick={() => openEditModal(popup)}
                    >
                      <Pencil size={16} />
                    </IconActionButton>

                    <IconActionButton
                      label="Excluir popup"
                      variant="delete"
                      onClick={() => openDeleteConfirm(popup.id)}
                    >
                      <Trash2 size={16} />
                    </IconActionButton>
                  </>
                }
              />
            ))
          )}
        </AdminSectionCard>

        <PopupFormModal
          open={isModalOpen}
          onClose={closeModal}
          onSubmit={handleSubmit}
          onDelete={
            editingId !== null ? () => openDeleteConfirm(editingId) : undefined
          }
          onClear={() => setForm(initialForm)}
          onPreview={openPreview}
          onChange={handleChange}
          onDisplayTypeChange={handleDisplayTypeChange}
          onPositionChange={handlePositionChange}
          isEditing={editingId !== null}
          canDelete={editingId !== null}
          saving={saving}
          form={form}
          displayTypeOptions={displayTypeOptions}
          positionOptions={positionOptions}
        />

        <ConfirmModal
          open={confirmModal.open}
          title={confirmModal.title}
          message={confirmModal.message}
          variant="danger"
          confirmText="Excluir"
          onClose={closeConfirmModal}
          onConfirm={handleDeleteConfirmed}
        />

        {isPreviewOpen && (
          <div className={styles.previewModalOverlay}>
            <div className={styles.previewModal}>
              <div className={styles.previewModalHeader}>
                <h3 className={styles.previewModalTitle}>Prévia do popup</h3>

                <button
                  type="button"
                  className={styles.previewCloseButton}
                  onClick={closePreview}
                >
                  <X size={18} />
                </button>
              </div>

              <div
                className={`${styles.previewArea} ${
                  form.displayType === "floating"
                    ? getPreviewPositionClass(form.position)
                    : styles.previewAreaCentered
                }`}
              >
                <div
                  className={
                    form.displayType === "modal"
                      ? styles.previewBox
                      : styles.previewFloatingBox
                  }
                >
                  <button
                    type="button"
                    className={styles.previewClose}
                    onClick={(e) => e.preventDefault()}
                    aria-label="Fechar prévia"
                  >
                    ×
                  </button>

                  <h4 className={styles.previewTitle}>
                    {form.title || "Título do popup"}
                  </h4>

                  <div
                    className={styles.previewText}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        form.message || "Aqui vai aparecer o texto do popup.",
                      ),
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    </AdminLayout>
  );
}
