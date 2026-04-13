import { useEffect, useMemo, useState } from "react";
import { Image, Pencil, Trash2, GripVertical } from "lucide-react";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import styles from "./styles.module.css";
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
import { BaseCard } from "../../components/BaseCard";
import { API_URL } from "../../../../config/env";
import { api } from "../../../../services/api";
import { useReorder } from "../../../../hooks/useReorder";
import { ReorderableList } from "../../../../components/ReorderableList";

type CampaignFormErrors = {
  title: string;
  text: string;
  image: string;
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

type SaveCampaignResponse = Partial<Campaign> & {
  requiresReorder?: boolean;
  message?: string;
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

  async function reloadCampaigns() {
    try {
      const response = await fetch(`${API_URL}/campaigns`);

      if (!response.ok) {
        throw new Error("Erro ao carregar campanhas");
      }

      const data: Campaign[] = await response.json();
      setCampaigns(data);
    } catch (error: unknown) {
      console.error("Erro ao carregar campanhas:", error);
      toast.error("Erro ao carregar campanhas.");
    }
  }

  useEffect(() => {
    void reloadCampaigns();
  }, []);

  const sortedCampaigns = useMemo(() => {
    return [...campaigns].sort((a, b) => a.order - b.order);
  }, [campaigns]);

  const { items, handleChange } = useReorder(
    sortedCampaigns,
    async (payload) => {
      try {
        await api.put("/campaigns/reorder", payload);
        await reloadCampaigns();
        toast.success("Ordem das campanhas atualizada com sucesso.");
      } catch (error: unknown) {
        console.error("Erro ao reordenar campanhas:", error);
        toast.error(
          getApiErrorMessage(error) || "Erro ao reordenar campanhas.",
        );
        await reloadCampaigns();
      }
    },
  );

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

  function closeCampaignFormModal() {
    setIsCampaignFormOpen(false);
  }

  function resetFormState() {
    setIsCampaignFormOpen(false);
    setSelectedCampaignId(null);
    setIsCreatingCampaign(false);
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

  function buildCampaignPayload(confirmReplaceOrder = false) {
    return {
      title: campaignFormData.title.trim(),
      text: campaignFormData.text.trim(),
      image: campaignFormData.image.trim(),
      order: Number(campaignFormData.order),
      active: campaignFormData.active,
      confirmReplaceOrder,
    };
  }

  async function saveCampaign(confirmReplaceOrder = false) {
    const payload = buildCampaignPayload(confirmReplaceOrder);

    if (isCreatingCampaign || selectedCampaignId === null) {
      const response = await api.post<SaveCampaignResponse>(
        "/campaigns",
        payload,
      );
      return response.data;
    }

    const response = await api.put<SaveCampaignResponse>(
      `/campaigns/${selectedCampaignId}`,
      payload,
    );
    return response.data;
  }

  async function finishSave(confirmReplaceOrder = false) {
    const result = await saveCampaign(confirmReplaceOrder);

    if (result.requiresReorder) {
      return result;
    }

    await reloadCampaigns();
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
            "Já existe uma campanha nessa posição. Deseja reorganizar automaticamente?",
        );
        return;
      }

      toast.success("Campanha salva com sucesso.");
      closeConfirmModal();
    } catch (error: unknown) {
      console.error("Erro ao salvar campanha:", error);
      toast.error(getApiErrorMessage(error) || "Erro ao salvar campanha.");
      closeConfirmModal();
    }
  }

  async function handleReorderSaveConfirmed() {
    try {
      await finishSave(true);

      toast.success("Campanha salva com reorganização.");
      closeConfirmModal();
    } catch (error: unknown) {
      console.error("Erro ao salvar com reorganização:", error);
      toast.error(
        getApiErrorMessage(error) || "Erro ao salvar com reorganização.",
      );
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

      await reloadCampaigns();

      setSelectedCampaignId(null);
      setIsCreatingCampaign(false);
      setIsCampaignFormOpen(false);
      setCampaignFormData({
        ...emptyCampaignForm,
        order: 1,
      });
      setErrors(emptyErrors);
      setFileName("");

      toast.success("Campanha excluída com sucesso.");
      closeConfirmModal();
    } catch (error: unknown) {
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
      title="Gerenciar campanhas"
      subtitle="Crie e edite campanhas do carrossel."
      buttonText="Nova campanha"
      onNew={handleNewCampaign}
    >
      <>
        <AdminSectionCard title="Campanhas cadastradas">
          {items.length === 0 ? (
            <p className={styles.emptyState}>Nenhuma campanha cadastrada.</p>
          ) : (
            <ReorderableList<Campaign>
              items={items}
              onChange={handleChange}
              className={styles.cardsGrid}
              itemClassName={styles.cardItem}
              renderItem={(campaign: Campaign, options) => {
                const displayOrder =
                  items.findIndex((item) => item.id === campaign.id) + 1;

                return (
                  <BaseCard
                    className={
                      options?.isOverlay ? styles.campaignCardOverlay : ""
                    }
                  >
                    <BaseCard.Header>
                      <div className={styles.campaignCardTitleWrap}>
                        <div className={styles.campaignCardIcon}>
                          <Image size={18} />
                        </div>

                        <div className={styles.campaignCardText}>
                          <h3 className={styles.campaignCardTitle}>
                            {campaign.title}
                          </h3>
                          <p className={styles.campaignCardMeta}>
                            imagem:{" "}
                            {campaign.image ? "selecionada" : "sem imagem"}
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
                      <div className={styles.campaignCardInfo}>
                        <span className={styles.campaignOrderBadge}>
                          posição: {displayOrder}
                        </span>

                        <BaseCard.StatusBadge
                          active={campaign.active}
                          activeLabel="Ativa"
                          inactiveLabel="Inativa"
                        />
                      </div>
                    </BaseCard.Body>

                    <BaseCard.Footer>
                      <BaseCard.IconActionButton
                        label={`Editar campanha ${campaign.title}`}
                        variant="edit"
                        onClick={() => handleSelectCampaign(campaign)}
                      >
                        <Pencil size={16} />
                      </BaseCard.IconActionButton>

                      <BaseCard.IconActionButton
                        label={`Excluir campanha ${campaign.title}`}
                        variant="delete"
                        onClick={() => handleDeleteRequest(campaign.id)}
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
