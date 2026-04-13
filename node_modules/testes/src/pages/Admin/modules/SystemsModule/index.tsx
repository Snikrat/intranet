import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, LayoutGrid, GripVertical } from "lucide-react";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import { ConfirmModal } from "../../components/ConfirmModal";
import { AdminSectionCard } from "../../components/AdminSectionCard";
import styles from "./styles.module.css";
import type { SystemCard } from "./types";
import { emptySystemForm } from "./mock";
import { AdminLayout } from "../../components/AdminLayout";
import { SystemFormModal } from "./components/SystemFormModal";
import { API_URL } from "../../../../config/env";
import { api } from "../../../../services/api";
import { useReorder } from "../../../../hooks/useReorder";
import { ReorderableList } from "../../../../components/ReorderableList";
import { BaseCard } from "../../components/BaseCard";

type SystemFormErrors = {
  title: string;
  description: string;
  link: string;
  order: string;
};

type ConfirmModalAction = "save" | "delete" | "reorder_save" | null;

type ConfirmModalState = {
  open: boolean;
  action: ConfirmModalAction;
  title: string;
  message: string;
};

type ApiErrorResponse = {
  message?: string;
};

type SaveSystemResponse = Partial<SystemCard> & {
  requiresReorder?: boolean;
  message?: string;
};

const emptyErrors: SystemFormErrors = {
  title: "",
  description: "",
  link: "",
  order: "",
};

export function SystemsModule() {
  const [systems, setSystems] = useState<SystemCard[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSystemFormOpen, setIsSystemFormOpen] = useState(false);

  const [formData, setFormData] = useState<Omit<SystemCard, "id">>({
    ...emptySystemForm,
    link: "",
    order: 1,
  });

  const [errors, setErrors] = useState<SystemFormErrors>(emptyErrors);

  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    open: false,
    action: null,
    title: "",
    message: "",
  });

  function getApiErrorMessage(error: unknown) {
    if (error instanceof AxiosError) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      return axiosError.response?.data?.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return undefined;
  }

  async function reloadSystems() {
    try {
      const response = await fetch(`${API_URL}/systems`);

      if (!response.ok) {
        throw new Error("Erro ao recarregar sistemas");
      }

      const data: SystemCard[] = await response.json();
      setSystems(data);
    } catch (error: unknown) {
      console.error("Erro ao recarregar sistemas:", error);
      toast.error("Erro ao atualizar lista de sistemas.");
    }
  }

  useEffect(() => {
    void reloadSystems();
  }, []);

  const sortedSystems = useMemo(() => {
    return [...systems].sort((a, b) => a.order - b.order);
  }, [systems]);

  const { items, handleChange } = useReorder(sortedSystems, async (payload) => {
    try {
      await api.put("/systems/reorder", payload);
      await reloadSystems();
      toast.success("Ordem dos sistemas atualizada com sucesso.");
    } catch (error: unknown) {
      console.error("Erro ao reordenar sistemas:", error);
      toast.error(getApiErrorMessage(error) || "Erro ao reordenar sistemas.");
      await reloadSystems();
    }
  });

  function validateForm() {
    const newErrors: SystemFormErrors = {
      title: "",
      description: "",
      link: "",
      order: "",
    };

    if (!formData.title.trim()) {
      newErrors.title = "Título obrigatório";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Mínimo de 3 caracteres";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Texto obrigatório";
    } else if (formData.description.trim().length < 5) {
      newErrors.description = "Mínimo de 5 caracteres";
    }

    if (!formData.link.trim()) {
      newErrors.link = "Link obrigatório";
    }

    if (!Number.isFinite(formData.order) || formData.order < 1) {
      newErrors.order = "Posição deve ser maior que 0";
    }

    setErrors(newErrors);

    return !Object.values(newErrors).some(Boolean);
  }

  function openConfirmModal(
    action: ConfirmModalAction,
    title: string,
    message: string,
  ) {
    setConfirmModal({
      open: true,
      action,
      title,
      message,
    });
  }

  function closeConfirmModal() {
    setConfirmModal({
      open: false,
      action: null,
      title: "",
      message: "",
    });
  }

  function closeSystemFormModal() {
    setIsSystemFormOpen(false);
  }

  function resetFormState() {
    setIsSystemFormOpen(false);
    setIsCreating(false);
    setSelectedId(null);
  }

  function handleSelectSystem(system: SystemCard) {
    setSelectedId(system.id);
    setIsCreating(false);
    setErrors(emptyErrors);

    setFormData({
      title: system.title,
      description: system.description,
      icon: system.icon,
      link: system.link || "",
      order: system.order,
      active: system.active,
    });

    setIsSystemFormOpen(true);
  }

  function handleNewSystem() {
    setSelectedId(null);
    setIsCreating(true);
    setErrors(emptyErrors);

    setFormData({
      ...emptySystemForm,
      link: "",
      order: systems.length + 1,
    });

    setIsSystemFormOpen(true);
  }

  function handleChangeField<K extends keyof Omit<SystemCard, "id">>(
    field: K,
    value: Omit<SystemCard, "id">[K],
  ) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field as keyof SystemFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  }

  function handleClearSystemForm() {
    setSelectedId(null);
    setIsCreating(true);
    setErrors(emptyErrors);

    setFormData({
      ...emptySystemForm,
      link: "",
      order: systems.length + 1,
    });
  }

  function handleSaveRequest(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    if (!validateForm()) {
      return;
    }

    openConfirmModal(
      "save",
      isCreating || selectedId === null
        ? "Salvar novo sistema"
        : "Salvar alterações",
      isCreating || selectedId === null
        ? "Deseja salvar este novo sistema?"
        : "Deseja salvar as alterações deste sistema?",
    );
  }

  function buildSystemPayload(confirmReplaceOrder = false) {
    return {
      title: formData.title.trim(),
      description: formData.description.trim(),
      icon: formData.icon,
      link: formData.link.trim(),
      order: Number(formData.order),
      active: formData.active,
      confirmReplaceOrder,
    };
  }

  async function saveSystem(confirmReplaceOrder = false) {
    const payload = buildSystemPayload(confirmReplaceOrder);

    if (isCreating || selectedId === null) {
      const response = await api.post<SaveSystemResponse>("/systems", payload);
      return response.data;
    }

    const response = await api.put<SaveSystemResponse>(
      `/systems/${selectedId}`,
      payload,
    );
    return response.data;
  }

  async function finishSave(confirmReplaceOrder = false) {
    const result = await saveSystem(confirmReplaceOrder);

    if (result.requiresReorder) {
      return result;
    }

    await reloadSystems();
    resetFormState();
    return result;
  }

  async function handleSaveConfirmed() {
    try {
      const result = await finishSave(false);

      if (result.requiresReorder) {
        openConfirmModal(
          "reorder_save",
          "Reorganizar posições",
          result.message ||
            "Já existe um sistema nessa posição. Deseja reorganizar automaticamente?",
        );
        return;
      }

      toast.success("Sistema salvo com sucesso.");
      closeConfirmModal();
    } catch (error: unknown) {
      console.error("Erro ao salvar sistema:", error);
      toast.error(getApiErrorMessage(error) || "Erro ao salvar sistema.");
      closeConfirmModal();
    }
  }

  async function handleReorderSaveConfirmed() {
    try {
      await finishSave(true);

      toast.success("Sistema salvo com reorganização.");
      closeConfirmModal();
    } catch (error: unknown) {
      console.error("Erro ao salvar com reorganização:", error);
      toast.error(
        getApiErrorMessage(error) || "Erro ao salvar com reorganização.",
      );
      closeConfirmModal();
    }
  }

  function handleDeleteRequest(systemId?: number) {
    const idToDelete = typeof systemId === "number" ? systemId : selectedId;

    if (idToDelete === null) return;

    setSelectedId(idToDelete);
    setIsCreating(false);

    openConfirmModal(
      "delete",
      "Excluir sistema",
      "Tem certeza que deseja excluir este sistema? Essa ação não pode ser desfeita.",
    );
  }

  async function handleDeleteConfirmed() {
    if (selectedId === null || isCreating) return;

    try {
      await api.delete(`/systems/${selectedId}`);

      await reloadSystems();

      setSelectedId(null);
      setIsCreating(false);
      setIsSystemFormOpen(false);
      setErrors(emptyErrors);
      setFormData({
        ...emptySystemForm,
        link: "",
        order: 1,
      });

      toast.success("Sistema excluído com sucesso.");
      closeConfirmModal();
    } catch (error: unknown) {
      console.error("Erro ao excluir sistema:", error);
      toast.error("Erro ao excluir sistema.");
      closeConfirmModal();
    }
  }

  function handleConfirmAction() {
    if (confirmModal.action === "save") {
      void handleSaveConfirmed();
      return;
    }

    if (confirmModal.action === "reorder_save") {
      void handleReorderSaveConfirmed();
      return;
    }

    if (confirmModal.action === "delete") {
      void handleDeleteConfirmed();
    }
  }

  return (
    <AdminLayout
      title="Gerenciar sistemas"
      subtitle="Crie, edite e organize os cards da intranet."
      buttonText="Novo sistema"
      onNew={handleNewSystem}
    >
      <>
        <AdminSectionCard title="Cards cadastrados">
          {items.length === 0 ? (
            <p className={styles.emptyState}>Nenhum sistema cadastrado.</p>
          ) : (
            <ReorderableList<SystemCard>
              items={items}
              onChange={handleChange}
              className={styles.cardsGrid}
              itemClassName={styles.cardItem}
              renderItem={(system: SystemCard, options) => {
                const displayOrder =
                  items.findIndex((item) => item.id === system.id) + 1;

                return (
                  <BaseCard
                    className={
                      options?.isOverlay ? styles.systemCardOverlay : ""
                    }
                  >
                    <BaseCard.Header>
                      <div className={styles.systemCardTitleWrap}>
                        <div className={styles.systemCardIcon}>
                          <LayoutGrid size={18} />
                        </div>

                        <div className={styles.systemCardText}>
                          <h3 className={styles.systemCardTitle}>
                            {system.title}
                          </h3>
                          <p className={styles.systemCardMeta}>
                            ícone: {system.icon}
                          </p>
                        </div>
                      </div>

                      <BaseCard.DragHandle
                        attributes={options?.dragHandleProps?.attributes}
                        listeners={options?.dragHandleProps?.listeners}
                      >
                        <GripVertical size={16} />
                      </BaseCard.DragHandle>
                    </BaseCard.Header>

                    <BaseCard.Body>
                      <div className={styles.systemCardBody}>
                        <p className={styles.systemCardDescription}>
                          {system.description}
                        </p>
                      </div>

                      <div className={styles.systemCardInfo}>
                        <span className={styles.systemOrderBadge}>
                          posição: {displayOrder}
                        </span>
                        <BaseCard.StatusBadge active={system.active} />
                      </div>
                    </BaseCard.Body>

                    <BaseCard.Footer>
                      <BaseCard.IconActionButton
                        label={`Editar sistema ${system.title}`}
                        variant="edit"
                        onClick={() => handleSelectSystem(system)}
                      >
                        <Pencil size={16} />
                      </BaseCard.IconActionButton>

                      <BaseCard.IconActionButton
                        label={`Excluir sistema ${system.title}`}
                        variant="delete"
                        onClick={() => handleDeleteRequest(system.id)}
                      >
                        <Trash2 size={16} />
                      </BaseCard.IconActionButton>
                    </BaseCard.Footer>
                  </BaseCard>
                );
              }}
            />
          )}
        </AdminSectionCard>

        <SystemFormModal
          open={isSystemFormOpen}
          onClose={closeSystemFormModal}
          onSubmit={handleSaveRequest}
          onDelete={() => handleDeleteRequest()}
          onClear={handleClearSystemForm}
          onChange={handleChangeField}
          isCreating={isCreating}
          canDelete={!isCreating && selectedId !== null}
          formData={formData}
          errors={errors}
        />

        <ConfirmModal
          open={confirmModal.open}
          title={confirmModal.title}
          message={confirmModal.message}
          variant={confirmModal.action === "delete" ? "danger" : "default"}
          onClose={closeConfirmModal}
          onConfirm={handleConfirmAction}
        />
      </>
    </AdminLayout>
  );
}
