import { useEffect, useMemo, useState } from "react";
import { Image, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import styles from "../../styles.module.css";
import type { Campaign } from "./types";
import { AdminLayout } from "../../components/AdminLayout";
import { CampaignFormModal } from "./components/CampaignFormModal";
import {
  CampaignImageLibraryModal,
  type CampaignLibraryImage,
} from "./components/CampaignImageLibraryModal";
import { ConfirmModal } from "../../components/ConfirmModal";
import { emptyCampaignForm } from "./mock";
import { AdminSectionCard } from "../../components/AdminSectionCard";
import { AdminListItem } from "../../components/AdminListItem";
import { StatusBadge } from "../../components/StatusBadge";
import { IconActionButton } from "../../components/IconActionButton";
import { Pagination } from "../../../../components/Pagination";
import { API_URL } from "../../../../config/env";
import { api } from "../../../../services/api";

const ITEMS_PER_PAGE = 5;

type CampaignFormErrors = {
  title: string;
  text: string;
  image: string;
  order: string;
};

type ConfirmModalState = {
  open: boolean;
  action: "save" | "delete" | null;
  title: string;
  message: string;
};

const emptyErrors: CampaignFormErrors = {
  title: "",
  text: "",
  image: "",
  order: "",
};

export function CampaignsModule() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(
    null,
  );
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [isCampaignFormOpen, setIsCampaignFormOpen] = useState(false);
  const [isImageLibraryOpen, setIsImageLibraryOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [campaignFormData, setCampaignFormData] = useState<
    Omit<Campaign, "id">
  >({
    ...emptyCampaignForm,
    order: 1,
  });

  const [errors, setErrors] = useState<CampaignFormErrors>(emptyErrors);

  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    open: false,
    action: null,
    title: "",
    message: "",
  });

  useEffect(() => {
    async function loadCampaigns() {
      try {
        const response = await fetch(`${API_URL}/campaigns`);

        if (!response.ok) {
          throw new Error("Erro ao carregar campanhas");
        }

        const data: Campaign[] = await response.json();
        setCampaigns(data);
      } catch (error) {
        console.error("Erro ao carregar campanhas:", error);
        toast.error("Erro ao carregar campanhas.");
      }
    }

    void loadCampaigns();
  }, []);

  const sortedCampaigns = useMemo(() => {
    return [...campaigns].sort((a, b) => a.order - b.order);
  }, [campaigns]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedCampaigns.length / ITEMS_PER_PAGE),
  );

  const paginatedCampaigns = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return sortedCampaigns.slice(start, end);
  }, [sortedCampaigns, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  function getImagePreviewUrl(image: string) {
    if (!image?.trim()) return "";

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    if (image.startsWith("/uploads/")) {
      return `${API_URL}${image}`;
    }

    return `${API_URL}/uploads/${image}`;
  }

  function validateForm() {
    const newErrors: CampaignFormErrors = {
      title: "",
      text: "",
      image: "",
      order: "",
    };

    if (!campaignFormData.title.trim()) {
      newErrors.title = "Título obrigatório";
    } else if (campaignFormData.title.trim().length < 3) {
      newErrors.title = "Mínimo de 3 caracteres";
    }

    if (!campaignFormData.text.trim()) {
      newErrors.text = "Texto obrigatório";
    } else if (campaignFormData.text.trim().length < 5) {
      newErrors.text = "Mínimo de 5 caracteres";
    }

    if (!campaignFormData.image.trim()) {
      newErrors.image = "Imagem obrigatória";
    }

    if (
      !Number.isFinite(campaignFormData.order) ||
      campaignFormData.order < 1
    ) {
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

  function closeCampaignFormModal() {
    setIsCampaignFormOpen(false);
  }

  function handleSelectCampaign(campaign: Campaign) {
    const normalizedImage = campaign.image?.trim() ?? "";

    setSelectedCampaignId(campaign.id);
    setIsCreatingCampaign(false);
    setErrors(emptyErrors);

    setCampaignFormData({
      title: campaign.title,
      text: campaign.text,
      image: normalizedImage,
      order: campaign.order,
      active: campaign.active,
    });

    const imageName =
      normalizedImage.split("/").pop()?.split("?")[0] || "Imagem selecionada";

    setFileName(imageName);
    setIsCampaignFormOpen(true);
  }

  function handleNewCampaign() {
    setSelectedCampaignId(null);
    setIsCreatingCampaign(true);
    setFileName("");
    setErrors(emptyErrors);

    setCampaignFormData({
      ...emptyCampaignForm,
      order: campaigns.length + 1,
    });

    setIsCampaignFormOpen(true);
  }

  function handleCampaignChange<K extends keyof Omit<Campaign, "id">>(
    field: K,
    value: Omit<Campaign, "id">[K],
  ) {
    setCampaignFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field in errors && errors[field as keyof CampaignFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  }

  function handleImageSelected(image: CampaignLibraryImage) {
    setCampaignFormData((prev) => ({
      ...prev,
      image: image.url,
    }));

    setFileName(image.name);

    if (errors.image) {
      setErrors((prev) => ({
        ...prev,
        image: "",
      }));
    }

    setIsImageLibraryOpen(false);
  }

  function handleClearCampaignForm() {
    setSelectedCampaignId(null);
    setIsCreatingCampaign(true);
    setFileName("");
    setErrors(emptyErrors);

    setCampaignFormData({
      ...emptyCampaignForm,
      order: campaigns.length + 1,
    });
  }

  function handleSaveRequest(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    if (!validateForm()) {
      return;
    }

    openConfirmModal(
      "save",
      isCreatingCampaign || selectedCampaignId === null
        ? "Salvar nova campanha"
        : "Salvar alterações",
      isCreatingCampaign || selectedCampaignId === null
        ? "Deseja salvar esta nova campanha?"
        : "Deseja salvar as alterações desta campanha?",
    );
  }

  async function handleSaveConfirmed() {
    try {
      if (isCreatingCampaign || selectedCampaignId === null) {
        const response = await api.post<Campaign>(
          "/campaigns",
          campaignFormData,
        );
        const newCampaign = response.data;

        setCampaigns((prev) => {
          const updated = [...prev, newCampaign];
          const updatedTotalPages = Math.max(
            1,
            Math.ceil(updated.length / ITEMS_PER_PAGE),
          );
          setCurrentPage(updatedTotalPages);
          return updated;
        });

        setSelectedCampaignId(newCampaign.id);
        setIsCreatingCampaign(false);
        setIsCampaignFormOpen(false);

        toast.success("Campanha criada com sucesso.");
        closeConfirmModal();
        return;
      }

      const response = await api.put<Campaign>(
        `/campaigns/${selectedCampaignId}`,
        campaignFormData,
      );

      const updatedCampaign = response.data;

      setCampaigns((prev) =>
        prev.map((campaign) =>
          campaign.id === selectedCampaignId ? updatedCampaign : campaign,
        ),
      );

      setIsCampaignFormOpen(false);
      toast.success("Campanha atualizada com sucesso.");
      closeConfirmModal();
    } catch (error) {
      console.error("Erro ao salvar campanha:", error);
      toast.error("Erro ao salvar campanha.");
      closeConfirmModal();
    }
  }

  function handleDeleteRequest(campaignId?: number) {
    const idToDelete =
      typeof campaignId === "number" ? campaignId : selectedCampaignId;

    if (idToDelete === null) return;

    setSelectedCampaignId(idToDelete);
    setIsCreatingCampaign(false);

    openConfirmModal(
      "delete",
      "Excluir campanha",
      "Tem certeza que deseja excluir esta campanha? Essa ação não pode ser desfeita.",
    );
  }

  async function handleDeleteConfirmed() {
    if (selectedCampaignId === null || isCreatingCampaign) return;

    try {
      await api.delete(`/campaigns/${selectedCampaignId}`);

      const updatedCampaigns = campaigns.filter(
        (campaign) => campaign.id !== selectedCampaignId,
      );

      setCampaigns(updatedCampaigns);
      setSelectedCampaignId(null);
      setIsCreatingCampaign(false);
      setIsCampaignFormOpen(false);
      setCampaignFormData({
        ...emptyCampaignForm,
        order: 1,
      });
      setErrors(emptyErrors);
      setFileName("");

      const updatedTotalPages = Math.max(
        1,
        Math.ceil(updatedCampaigns.length / ITEMS_PER_PAGE),
      );
      setCurrentPage((prev) => Math.min(prev, updatedTotalPages));

      toast.success("Campanha excluída com sucesso.");
      closeConfirmModal();
    } catch (error) {
      console.error("Erro ao excluir campanha:", error);
      toast.error("Erro ao excluir campanha.");
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
      title="Gerenciar campanhas"
      subtitle="Crie e edite campanhas do carrossel."
      buttonText="Nova campanha"
      onNew={handleNewCampaign}
    >
      <>
        <AdminSectionCard
          title="Campanhas cadastradas"
          footer={
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          }
        >
          {paginatedCampaigns.length === 0 ? (
            <p className={styles.emptyState}>Nenhuma campanha cadastrada.</p>
          ) : (
            paginatedCampaigns.map((campaign) => (
              <AdminListItem
                key={campaign.id}
                title={campaign.title}
                description={`imagem: ${
                  campaign.image ? "selecionada" : "sem imagem"
                } • posição: ${campaign.order}`}
                icon={<Image size={18} />}
                status={
                  <StatusBadge
                    active={campaign.active}
                    activeLabel="Ativa"
                    inactiveLabel="Inativa"
                  />
                }
                actions={
                  <>
                    <IconActionButton
                      label={`Editar campanha ${campaign.title}`}
                      variant="edit"
                      onClick={() => handleSelectCampaign(campaign)}
                    >
                      <Pencil size={16} />
                    </IconActionButton>

                    <IconActionButton
                      label={`Excluir campanha ${campaign.title}`}
                      variant="delete"
                      onClick={() => handleDeleteRequest(campaign.id)}
                    >
                      <Trash2 size={16} />
                    </IconActionButton>
                  </>
                }
              />
            ))
          )}
        </AdminSectionCard>

        <CampaignFormModal
          open={isCampaignFormOpen}
          onClose={closeCampaignFormModal}
          onSubmit={handleSaveRequest}
          onDelete={() => handleDeleteRequest()}
          onClear={handleClearCampaignForm}
          onOpenImageLibrary={() => setIsImageLibraryOpen(true)}
          onChange={handleCampaignChange}
          isCreating={isCreatingCampaign}
          canDelete={!isCreatingCampaign && selectedCampaignId !== null}
          fileName={fileName}
          formData={campaignFormData}
          errors={errors}
          getImagePreviewUrl={getImagePreviewUrl}
        />

        <ConfirmModal
          open={confirmModal.open}
          title={confirmModal.title}
          message={confirmModal.message}
          variant={confirmModal.action === "delete" ? "danger" : "default"}
          onClose={closeConfirmModal}
          onConfirm={handleConfirmAction}
        />

        <CampaignImageLibraryModal
          open={isImageLibraryOpen}
          onClose={() => setIsImageLibraryOpen(false)}
          onSelect={handleImageSelected}
        />
      </>
    </AdminLayout>
  );
}
