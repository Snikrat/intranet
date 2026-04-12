import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, LayoutGrid } from "lucide-react";
import { toast } from "react-toastify";
import { ConfirmModal } from "../../components/ConfirmModal";
import { AdminSectionCard } from "../../components/AdminSectionCard";
import { AdminListItem } from "../../components/AdminListItem";
import { StatusBadge } from "../../components/StatusBadge";
import { IconActionButton } from "../../components/IconActionButton";
import { Pagination } from "../../../../components/Pagination";
import styles from "../../styles.module.css";
import type { SystemCard } from "./types";
import { emptySystemForm } from "./mock";
import { AdminLayout } from "../../components/AdminLayout";
import { SystemFormModal } from "./components/SystemFormModal";
import { API_URL } from "../../../../services/api";

const ITEMS_PER_PAGE = 5;

type SystemFormErrors = {
  title: string;
  description: string;
  link: string;
  order: string;
};

type ConfirmModalState = {
  open: boolean;
  action: "save" | "delete" | null;
  title: string;
  message: string;
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
  const [currentPage, setCurrentPage] = useState(1);

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

  useEffect(() => {
    async function loadSystems() {
      try {
        const response = await fetch(`${API_URL}/systems`);

        if (!response.ok) {
          throw new Error("Erro ao carregar sistemas");
        }

        const data: SystemCard[] = await response.json();
        setSystems(data);
      } catch (error) {
        console.error("Erro ao carregar sistemas:", error);
        toast.error("Erro ao carregar sistemas.");
      }
    }

    void loadSystems();
  }, []);

  const sortedSystems = useMemo(() => {
    return [...systems].sort((a, b) => a.order - b.order);
  }, [systems]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedSystems.length / ITEMS_PER_PAGE),
  );

  const paginatedSystems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return sortedSystems.slice(start, end);
  }, [sortedSystems, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
    action: "save" | "delete",
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

  function handleChange<K extends keyof Omit<SystemCard, "id">>(
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

  async function handleSaveConfirmed() {
    try {
      if (isCreating || selectedId === null) {
        const response = await fetch(`${API_URL}/systems`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error("Erro ao criar sistema");
        }

        const newSystem: SystemCard = await response.json();

        setSystems((prev) => {
          const updated = [...prev, newSystem];
          const updatedTotalPages = Math.max(
            1,
            Math.ceil(updated.length / ITEMS_PER_PAGE),
          );
          setCurrentPage(updatedTotalPages);
          return updated;
        });

        setSelectedId(newSystem.id);
        setIsCreating(false);
        setIsSystemFormOpen(false);

        toast.success("Sistema criado com sucesso.");
        closeConfirmModal();
        return;
      }

      const response = await fetch(`${API_URL}/systems/${selectedId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar sistema");
      }

      const updatedSystem: SystemCard = await response.json();

      setSystems((prev) =>
        prev.map((system) =>
          system.id === selectedId ? updatedSystem : system,
        ),
      );

      setIsSystemFormOpen(false);
      toast.success("Sistema atualizado com sucesso.");
      closeConfirmModal();
    } catch (error) {
      console.error("Erro ao salvar sistema:", error);
      toast.error("Erro ao salvar sistema.");
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
      const response = await fetch(`${API_URL}/systems/${selectedId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir sistema");
      }

      const updatedSystems = systems.filter(
        (system) => system.id !== selectedId,
      );

      setSystems(updatedSystems);
      setSelectedId(null);
      setIsCreating(false);
      setIsSystemFormOpen(false);
      setErrors(emptyErrors);
      setFormData({
        ...emptySystemForm,
        link: "",
        order: 1,
      });

      const updatedTotalPages = Math.max(
        1,
        Math.ceil(updatedSystems.length / ITEMS_PER_PAGE),
      );
      setCurrentPage((prev) => Math.min(prev, updatedTotalPages));

      toast.success("Sistema excluído com sucesso.");
      closeConfirmModal();
    } catch (error) {
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
        <AdminSectionCard
          title="Cards cadastrados"
          footer={
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          }
        >
          {paginatedSystems.length === 0 ? (
            <p className={styles.emptyState}>Nenhum sistema cadastrado.</p>
          ) : (
            paginatedSystems.map((system) => (
              <AdminListItem
                key={system.id}
                title={system.title}
                description={`ícone: ${system.icon} • posição: ${system.order}`}
                icon={<LayoutGrid size={18} />}
                status={<StatusBadge active={system.active} />}
                actions={
                  <>
                    <IconActionButton
                      label={`Editar sistema ${system.title}`}
                      variant="edit"
                      onClick={() => handleSelectSystem(system)}
                    >
                      <Pencil size={16} />
                    </IconActionButton>

                    <IconActionButton
                      label={`Excluir sistema ${system.title}`}
                      variant="delete"
                      onClick={() => handleDeleteRequest(system.id)}
                    >
                      <Trash2 size={16} />
                    </IconActionButton>
                  </>
                }
              />
            ))
          )}
        </AdminSectionCard>

        <SystemFormModal
          open={isSystemFormOpen}
          onClose={closeSystemFormModal}
          onSubmit={handleSaveRequest}
          onDelete={() => handleDeleteRequest()}
          onClear={handleClearSystemForm}
          onChange={handleChange}
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
