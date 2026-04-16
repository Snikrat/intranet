import { useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { CardsSaude } from "./modules/CampaignsSection";
import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";
import { Hero } from "./modules/Hero";
import { PopupModal } from "../../components/PopupModal";
import { SystemsSection } from "./modules/SystemSection";

import { API_URL } from "../../config/env";

type PopupDisplayType = "modal" | "floating";

type PopupPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "bottom-center";

type ActivePopup = {
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

function App() {
  const popupTimeoutRef = useRef<number | null>(null);

  const [popup, setPopup] = useState<ActivePopup | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  function handleClosePopup(currentPopup?: ActivePopup) {
    const popupToClose = currentPopup ?? popup;

    if (!popupToClose) return;

    if (popupToClose.showOnce) {
      localStorage.setItem(`popup_seen_${popupToClose.id}`, "true");
    }

    if (popupTimeoutRef.current) {
      clearTimeout(popupTimeoutRef.current);
      popupTimeoutRef.current = null;
    }

    setShowPopup(false);
  }

  useEffect(() => {
    const shouldLockScroll =
      showPopup && popup && popup.displayType === "modal";

    if (shouldLockScroll) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showPopup, popup]);

  useEffect(() => {
    function closePopupFromEffect(currentPopup: ActivePopup) {
      if (currentPopup.showOnce) {
        localStorage.setItem(`popup_seen_${currentPopup.id}`, "true");
      }

      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
        popupTimeoutRef.current = null;
      }

      setShowPopup(false);
    }

    async function loadPopup() {
      try {
        const response = await fetch(`${API_URL}/popup/active`);
        const data = await response.json();

        if (!response.ok || !data) {
          return;
        }

        const storageKey = `popup_seen_${data.id}`;
        const alreadySeen = localStorage.getItem(storageKey);

        if (data.showOnce && alreadySeen) {
          return;
        }

        const sanitizedPopup: ActivePopup = {
          ...data,
          displayType: data.displayType ?? "modal",
          position: data.position ?? "top-right",
          message: DOMPurify.sanitize(data.message),
        };

        setPopup(sanitizedPopup);
        setShowPopup(true);

        if (
          !sanitizedPopup.closeOnlyOnButton &&
          sanitizedPopup.autoCloseSeconds &&
          sanitizedPopup.autoCloseSeconds > 0
        ) {
          popupTimeoutRef.current = window.setTimeout(() => {
            closePopupFromEffect(sanitizedPopup);
          }, sanitizedPopup.autoCloseSeconds * 1000);
        }
      } catch (error) {
        console.error("Erro ao carregar popup ativo:", error);
      }
    }

    void loadPopup();

    return () => {
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
        popupTimeoutRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <Header />
      <Hero />
      <SystemsSection />
      <CardsSaude />
      <Footer />

      {showPopup && popup && (
        <PopupModal
          titulo={popup.title}
          mensagem={popup.message}
          onClose={() => handleClosePopup()}
          displayType={popup.displayType}
          position={popup.position}
        />
      )}
    </>
  );
}

export default App;
