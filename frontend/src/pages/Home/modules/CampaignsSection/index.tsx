import { useEffect, useMemo, useState } from "react";
import styles from "./styles.module.css";

type CampaignItem = {
  id: number;
  title: string;
  text: string;
  image: string;
  order: number;
  active: boolean;
};

export function CardsSaude() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function loadCampaigns() {
      try {
        const response = await fetch("http://localhost:3000/campaigns");

        if (!response.ok) {
          throw new Error("Erro ao carregar campanhas");
        }

        const data: CampaignItem[] = await response.json();

        const activeCampaigns = data
          .filter((campaign) => campaign.active)
          .sort((a, b) => a.order - b.order);

        setCampaigns(activeCampaigns);
      } catch (error) {
        console.error("Erro ao carregar campanhas:", error);
      }
    }

    loadCampaigns();
  }, []);

  const normalizedCampaigns = useMemo(() => {
    return campaigns.map((campaign) => ({
      ...campaign,
      paragraphs: campaign.text
        .split("\n")
        .map((paragraph) => paragraph.trim())
        .filter(Boolean),
      alt: `campanha ${campaign.title}`,
    }));
  }, [campaigns]);

  function prevSlide() {
    setCurrentIndex((prev) =>
      prev === 0 ? normalizedCampaigns.length - 1 : prev - 1,
    );
  }

  function nextSlide() {
    setCurrentIndex((prev) =>
      prev === normalizedCampaigns.length - 1 ? 0 : prev + 1,
    );
  }

  useEffect(() => {
    if (normalizedCampaigns.length === 0) {
      setCurrentIndex(0);
      return;
    }

    if (currentIndex > normalizedCampaigns.length - 1) {
      setCurrentIndex(0);
    }
  }, [normalizedCampaigns, currentIndex]);

  if (normalizedCampaigns.length === 0) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <p className={styles.footerText}>
            nenhuma campanha ativa no momento.
          </p>
        </div>
      </section>
    );
  }

  const currentCard = normalizedCampaigns[currentIndex];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.carousel}>
          <button
            type="button"
            className={styles.arrowButton}
            onClick={prevSlide}
          >
            ←
          </button>

          <article className={styles.card}>
            <div className={styles.textContent}>
              <h2 className={styles.title}>{currentCard.title}</h2>

              {currentCard.paragraphs.map((paragraph, index) => (
                <p key={index} className={styles.text}>
                  {paragraph}
                </p>
              ))}
            </div>

            <div className={styles.imageWrapper}>
              <img
                src={currentCard.image}
                alt={currentCard.alt}
                className={styles.image}
              />
            </div>
          </article>

          <button
            type="button"
            className={styles.arrowButton}
            onClick={nextSlide}
          >
            →
          </button>
        </div>

        <div className={styles.dots}>
          {normalizedCampaigns.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`${styles.dot} ${
                index === currentIndex ? styles.activeDot : ""
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>

        <p className={styles.footerText}>
          Temos orgulho em atender projetos voltados para o bem da sociedade.
        </p>
      </div>
    </section>
  );
}
