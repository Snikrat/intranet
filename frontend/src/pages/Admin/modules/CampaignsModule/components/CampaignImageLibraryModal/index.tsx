import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "../../../../components/Button";
import { Modal } from "../../../../components/Modal";
import styles from "./styles.module.css";

export type CampaignLibraryImage = {
  id: number;
  name: string;
  url: string;
};

type CampaignImageLibraryModalProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (image: CampaignLibraryImage) => void;
};

export function CampaignImageLibraryModal({
  open,
  onClose,
  onSelect,
}: CampaignImageLibraryModalProps) {
  const [images, setImages] = useState<CampaignLibraryImage[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageToDelete, setImageToDelete] =
    useState<CampaignLibraryImage | null>(null);

  useEffect(() => {
    if (!open) return;

    async function loadImages() {
      try {
        setIsLoading(true);

        const response = await fetch("http://localhost:3000/media/images");

        if (!response.ok) {
          throw new Error("Erro ao carregar imagens");
        }

        const data: CampaignLibraryImage[] = await response.json();
        setImages(data);
      } catch (error) {
        console.error("Erro ao carregar imagens:", error);
        toast.error("Erro ao carregar biblioteca de imagens.");
      } finally {
        setIsLoading(false);
      }
    }

    loadImages();
  }, [open]);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("http://localhost:3000/media/images", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar imagem");
      }

      const newImage: CampaignLibraryImage = await response.json();

      setImages((prev) => [newImage, ...prev]);
      setSelectedId(newImage.id);

      toast.success("Imagem enviada com sucesso.");
      event.target.value = "";
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      toast.error("Erro ao enviar imagem.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDeleteConfirmed() {
    if (!imageToDelete) return;

    try {
      setIsDeleting(true);

      const response = await fetch(
        `http://localhost:3000/media/images/${imageToDelete.id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao excluir imagem");
      }

      setImages((prev) =>
        prev.filter((image) => image.id !== imageToDelete.id),
      );

      if (selectedId === imageToDelete.id) {
        setSelectedId(null);
      }

      toast.success("Imagem excluída com sucesso.");
      setImageToDelete(null);
    } catch (error) {
      console.error("Erro ao excluir imagem:", error);
      toast.error("Erro ao excluir imagem.");
    } finally {
      setIsDeleting(false);
    }
  }

  const selectedImage = images.find((image) => image.id === selectedId) ?? null;

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Biblioteca de imagens"
        subtitle="Escolha uma imagem existente ou envie uma nova."
        size="lg"
        footer={
          <div className={styles.footerBar}>
            <div className={styles.footerLeft}>
              <label
                htmlFor="campaign-library-upload"
                className={styles.uploadLabel}
              >
                {isUploading ? "Enviando..." : "Upload nova imagem"}
              </label>

              <input
                id="campaign-library-upload"
                type="file"
                accept="image/*"
                className={styles.hiddenInput}
                onChange={handleUpload}
                disabled={isUploading}
              />
            </div>

            <div className={styles.footerRight}>
              <Button variant="secondary" onClick={onClose}>
                Cancelar
              </Button>

              <Button
                variant="primary"
                disabled={!selectedImage}
                onClick={() => {
                  if (!selectedImage) return;
                  onSelect(selectedImage);
                  onClose();
                }}
              >
                Selecionar imagem
              </Button>
            </div>
          </div>
        }
      >
        {isLoading ? (
          <p className={styles.emptyText}>Carregando imagens...</p>
        ) : images.length === 0 ? (
          <p className={styles.emptyText}>Nenhuma imagem cadastrada ainda.</p>
        ) : (
          <div className={styles.grid}>
            {images.map((image) => (
              <div
                key={image.id}
                className={`${styles.card} ${
                  selectedId === image.id ? styles.cardActive : ""
                }`}
              >
                <button
                  type="button"
                  className={styles.selectButton}
                  onClick={() => setSelectedId(image.id)}
                >
                  <img
                    src={image.url}
                    alt={image.name}
                    className={styles.thumb}
                  />
                  <span className={styles.imageName}>{image.name}</span>
                </button>

                <Button
                  variant="dangerSoft"
                  onClick={() => setImageToDelete(image)}
                >
                  Excluir
                </Button>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Modal
        open={!!imageToDelete}
        onClose={() => !isDeleting && setImageToDelete(null)}
        title="Confirmar exclusão"
        size="sm"
        footer={
          <div className={styles.confirmFooter}>
            <Button
              variant="secondary"
              onClick={() => setImageToDelete(null)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>

            <Button
              variant="danger"
              onClick={handleDeleteConfirmed}
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </Button>
          </div>
        }
      >
        <p className={styles.confirmText}>
          Tem certeza que deseja excluir a imagem{" "}
          <strong>{imageToDelete?.name}</strong>?
        </p>
      </Modal>
    </>
  );
}
