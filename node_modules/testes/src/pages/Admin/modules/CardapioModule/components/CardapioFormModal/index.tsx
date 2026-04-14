import { Button } from "../../../../components/Button";
import { Modal } from "../../../../components/Modal";
import styles from "./styles.module.css";

type DayMenu = {
  meals: string[];
  isHoliday: boolean;
  isUndefined: boolean;
};

type WeeklyMenu = {
  monday: DayMenu;
  tuesday: DayMenu;
  wednesday: DayMenu;
  thursday: DayMenu;
  friday: DayMenu;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onClear?: () => void;
  onChange: <K extends keyof DayMenu>(
    day: keyof WeeklyMenu,
    field: K,
    value: DayMenu[K],
  ) => void;
  data: WeeklyMenu;
};

const days = [
  { key: "monday", label: "Segunda" },
  { key: "tuesday", label: "Terça" },
  { key: "wednesday", label: "Quarta" },
  { key: "thursday", label: "Quinta" },
  { key: "friday", label: "Sexta" },
] as const;

function getTextareaValue(day: DayMenu) {
  if (day.isHoliday) return "Feriado";
  if (day.isUndefined) return "A definir";
  return day.meals.join("\n");
}

function getTextareaPlaceholder(day: DayMenu) {
  if (day.isHoliday) return "Dia marcado como feriado";
  if (day.isUndefined) return "Cardápio ainda não enviado";
  return "Digite um item por linha\nEx:\nFrango grelhado\nArroz\nFeijão";
}

function getDayStatus(day: DayMenu) {
  if (day.isHoliday) {
    return {
      label: "Feriado",
      className: "statusHoliday",
    };
  }

  if (day.isUndefined) {
    return {
      label: "A definir",
      className: "statusUndefined",
    };
  }

  if (day.meals.some((meal) => meal.trim())) {
    return {
      label: "Preenchido",
      className: "statusFilled",
    };
  }

  return {
    label: "Vazio",
    className: "statusEmpty",
  };
}

function getSummary(data: WeeklyMenu) {
  const values = Object.values(data);

  const holidayCount = values.filter((day) => day.isHoliday).length;
  const undefinedCount = values.filter((day) => day.isUndefined).length;
  const filledCount = values.filter(
    (day) =>
      !day.isHoliday &&
      !day.isUndefined &&
      day.meals.some((meal) => meal.trim()),
  ).length;

  return {
    filledCount,
    undefinedCount,
    holidayCount,
  };
}

export function CardapioFormModal({
  open,
  onClose,
  onSubmit,
  onClear,
  onChange,
  data,
}: Props) {
  const summary = getSummary(data);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Editar cardápio da semana"
      subtitle="Preencha os dias de segunda a sexta. Você pode deixar dias como “A definir” e atualizar depois."
      size="xl"
      footer={
        <div className={styles.footer}>
          <div className={styles.footerInfo}>
            <span className={styles.footerInfoItem}>
              {summary.filledCount} preenchido
              {summary.filledCount !== 1 ? "s" : ""}
            </span>
            <span className={styles.footerInfoItem}>
              {summary.undefinedCount} a definir
            </span>
            <span className={styles.footerInfoItem}>
              {summary.holidayCount} feriado
              {summary.holidayCount !== 1 ? "s" : ""}
            </span>
          </div>

          <div className={styles.footerRight}>
            {onClear && (
              <Button type="button" variant="secondary" onClick={onClear}>
                Limpar
              </Button>
            )}

            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>

            <Button type="button" variant="primary" onClick={onSubmit}>
              Salvar alterações
            </Button>
          </div>
        </div>
      }
    >
      <div className={styles.container}>
        {days.map(({ key, label }) => {
          const day = data[key];
          const isLocked = day.isHoliday || day.isUndefined;
          const status = getDayStatus(day);

          return (
            <div key={key} className={styles.dayCard}>
              <div className={styles.dayHeader}>
                <h3 className={styles.dayTitle}>{label}</h3>
                <span
                  className={`${styles.statusBadge} ${
                    styles[status.className]
                  }`}
                >
                  {status.label}
                </span>
              </div>

              <textarea
                className={`${styles.textarea} ${
                  isLocked ? styles.textareaLocked : ""
                }`}
                value={getTextareaValue(day)}
                onChange={(e) =>
                  onChange(
                    key,
                    "meals",
                    e.target.value.split("\n").map((meal) => meal.trimStart()),
                  )
                }
                disabled={isLocked}
                placeholder={getTextareaPlaceholder(day)}
              />

              <div className={styles.optionRow}>
                <label className={styles.optionPill}>
                  <input
                    type="checkbox"
                    checked={day.isUndefined}
                    onChange={(e) =>
                      onChange(key, "isUndefined", e.target.checked)
                    }
                  />
                  <span>A definir</span>
                </label>

                <label className={styles.optionPill}>
                  <input
                    type="checkbox"
                    checked={day.isHoliday}
                    onChange={(e) =>
                      onChange(key, "isHoliday", e.target.checked)
                    }
                  />
                  <span>Feriado</span>
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
