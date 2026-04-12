import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import styles from "./styles.module.css";
import { AdminLayout } from "../../components/AdminLayout";
import { CardapioFormModal } from "./components/CardapioFormModal";
import { ConfirmModal } from "../../components/ConfirmModal";
import { AdminSectionCard } from "../../components/AdminSectionCard";
import { StatusBadge } from "../../components/StatusBadge";
import { API_URL } from "../../../../services/api";

type DayKey = "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta";

type DayMenu = {
  items: string;
  isToDefine: boolean;
  isHoliday: boolean;
};

type WeeklyMenu = {
  active: boolean;
  days: Record<DayKey, DayMenu>;
};

type ModalDayMenu = {
  meals: string[];
  isHoliday: boolean;
  isUndefined: boolean;
};

type ModalWeeklyMenu = {
  monday: ModalDayMenu;
  tuesday: ModalDayMenu;
  wednesday: ModalDayMenu;
  thursday: ModalDayMenu;
  friday: ModalDayMenu;
};

type ConfirmModalState = {
  open: boolean;
  action: "save" | "clear" | null;
  title: string;
  message: string;
};

const emptyMenu: WeeklyMenu = {
  active: true,
  days: {
    Segunda: { items: "", isToDefine: false, isHoliday: false },
    Terça: { items: "", isToDefine: false, isHoliday: false },
    Quarta: { items: "", isToDefine: false, isHoliday: false },
    Quinta: { items: "", isToDefine: false, isHoliday: false },
    Sexta: { items: "", isToDefine: false, isHoliday: false },
  },
};

const emptyModalMenu: ModalWeeklyMenu = {
  monday: { meals: [], isHoliday: false, isUndefined: false },
  tuesday: { meals: [], isHoliday: false, isUndefined: false },
  wednesday: { meals: [], isHoliday: false, isUndefined: false },
  thursday: { meals: [], isHoliday: false, isUndefined: false },
  friday: { meals: [], isHoliday: false, isUndefined: false },
};

const dayKeys: DayKey[] = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

function getDayPreviewText(day: DayMenu) {
  if (day.isHoliday) return "Feriado";
  if (day.isToDefine) return "A definir";
  return day.items.trim() || "Sem itens cadastrados";
}

async function getCurrentMenu(): Promise<WeeklyMenu> {
  const response = await fetch(`${API_URL}/menu/current`);

  if (!response.ok) {
    throw new Error("Erro ao buscar cardápio");
  }

  return response.json();
}

async function saveCurrentMenu(menu: WeeklyMenu): Promise<WeeklyMenu> {
  const response = await fetch(`${API_URL}/menu/current`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(menu),
  });

  if (!response.ok) {
    throw new Error("Erro ao salvar cardápio");
  }

  return response.json();
}

async function deleteCurrentMenu(): Promise<void> {
  const response = await fetch(`${API_URL}/menu/current`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Erro ao limpar cardápio");
  }
}

function convertDayToModal(day: DayMenu): ModalDayMenu {
  return {
    meals:
      day.isHoliday || day.isToDefine || !day.items.trim()
        ? []
        : day.items.split("\n"),
    isHoliday: day.isHoliday,
    isUndefined: day.isToDefine,
  };
}

function convertMenuToModal(menu: WeeklyMenu): ModalWeeklyMenu {
  return {
    monday: convertDayToModal(menu.days.Segunda),
    tuesday: convertDayToModal(menu.days.Terça),
    wednesday: convertDayToModal(menu.days.Quarta),
    thursday: convertDayToModal(menu.days.Quinta),
    friday: convertDayToModal(menu.days.Sexta),
  };
}

function convertDayToApi(day: ModalDayMenu): DayMenu {
  if (day.isHoliday) {
    return {
      items: "Feriado",
      isToDefine: false,
      isHoliday: true,
    };
  }

  if (day.isUndefined) {
    return {
      items: "A definir",
      isToDefine: true,
      isHoliday: false,
    };
  }

  return {
    items: day.meals.join("\n").trim(),
    isToDefine: false,
    isHoliday: false,
  };
}

function convertMenuToApi(
  modalMenu: ModalWeeklyMenu,
  active: boolean,
): WeeklyMenu {
  return {
    active,
    days: {
      Segunda: convertDayToApi(modalMenu.monday),
      Terça: convertDayToApi(modalMenu.tuesday),
      Quarta: convertDayToApi(modalMenu.wednesday),
      Quinta: convertDayToApi(modalMenu.thursday),
      Sexta: convertDayToApi(modalMenu.friday),
    },
  };
}

export function CardapioModule() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menu, setMenu] = useState<WeeklyMenu>(emptyMenu);
  const [formMenu, setFormMenu] = useState<ModalWeeklyMenu>(emptyModalMenu);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    open: false,
    action: null,
    title: "",
    message: "",
  });

  useEffect(() => {
    async function loadMenu() {
      try {
        setIsLoading(true);
        const data = await getCurrentMenu();
        setMenu(data);
        setFormMenu(convertMenuToModal(data));
      } catch (error) {
        console.error(error);
        toast.error("Não foi possível carregar o cardápio.");
        setMenu(emptyMenu);
        setFormMenu(emptyModalMenu);
      } finally {
        setIsLoading(false);
      }
    }

    void loadMenu();
  }, []);

  function openConfirmModal(
    action: "save" | "clear",
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

  function handleOpenModal() {
    setFormMenu(convertMenuToModal(menu));
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    if (isSaving) return;
    setIsModalOpen(false);
  }

  function handleFormChange<K extends keyof ModalDayMenu>(
    day: keyof ModalWeeklyMenu,
    field: K,
    value: ModalDayMenu[K],
  ) {
    setFormMenu((prev) => {
      const updatedDay = {
        ...prev[day],
        [field]: value,
      };

      if (field === "meals") {
        updatedDay.isHoliday = false;
        updatedDay.isUndefined = false;
      }

      if (field === "isHoliday" && value === true) {
        updatedDay.isUndefined = false;
        updatedDay.meals = [];
      }

      if (field === "isUndefined" && value === true) {
        updatedDay.isHoliday = false;
        updatedDay.meals = [];
      }

      return {
        ...prev,
        [day]: updatedDay,
      };
    });
  }

  function handleSaveRequest() {
    openConfirmModal(
      "save",
      "Confirmar alteração",
      "Deseja salvar o cardápio da semana atual?",
    );
  }

  function handleClearRequest() {
    openConfirmModal(
      "clear",
      "Limpar cardápio",
      "Tem certeza que deseja limpar o cardápio atual? Essa ação removerá os dados preenchidos.",
    );
  }

  async function handleConfirmSave() {
    try {
      setIsSaving(true);

      const payload = convertMenuToApi(formMenu, menu.active);
      const savedMenu = await saveCurrentMenu(payload);

      setMenu(savedMenu);
      setFormMenu(convertMenuToModal(savedMenu));
      setIsModalOpen(false);
      handleCloseConfirm();

      toast.success("Cardápio salvo com sucesso.");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar o cardápio.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleCloseConfirm() {
    if (isSaving) return;

    setConfirmModal({
      open: false,
      action: null,
      title: "",
      message: "",
    });
  }

  async function handleClearCurrentMenu() {
    try {
      setIsSaving(true);
      await deleteCurrentMenu();
      setMenu(emptyMenu);
      setFormMenu(emptyModalMenu);
      setIsModalOpen(false);
      handleCloseConfirm();

      toast.success("Cardápio atual limpo com sucesso.");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao limpar o cardápio atual.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleConfirmAction() {
    if (confirmModal.action === "save") {
      void handleConfirmSave();
      return;
    }

    if (confirmModal.action === "clear") {
      void handleClearCurrentMenu();
    }
  }

  return (
    <>
      <AdminLayout
        title="Gerenciar cardápio"
        subtitle="Edite o cardápio da semana atual, de segunda a sexta."
        buttonText="Editar cardápio"
        onNew={handleOpenModal}
      >
        <AdminSectionCard title="Cardápio da semana atual">
          <div className={styles.weekCard}>
            <div className={styles.weekCardHeader}>
              <div>
                <strong className={styles.weekCardTitle}>Cardápio atual</strong>
                <span className={styles.weekCardSubtitle}>
                  Clique em “Editar cardápio” para atualizar os dias da semana
                </span>
              </div>

              <StatusBadge active={menu.active} />
            </div>

            {isLoading ? (
              <p className={styles.weekPreviewText}>Carregando cardápio...</p>
            ) : (
              <div className={styles.weekPreviewGrid}>
                {dayKeys.map((day) => (
                  <div key={day} className={styles.weekPreviewItem}>
                    <strong className={styles.weekPreviewDay}>{day}</strong>
                    <p className={styles.weekPreviewText}>
                      {getDayPreviewText(menu.days[day])}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </AdminSectionCard>
      </AdminLayout>

      <CardapioFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSaveRequest}
        onClear={handleClearRequest}
        onChange={handleFormChange}
        data={formMenu}
      />

      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.action === "clear" ? "danger" : "default"}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmAction}
      />
    </>
  );
}
