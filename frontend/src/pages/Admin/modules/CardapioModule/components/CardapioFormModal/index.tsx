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

export function CardapioFormModal({
  open,
  onClose,
  onSubmit,
  onClear,
  onChange,
  data,
}: Props) {
  function getTextareaValue(day: DayMenu) {
    if (day.isHoliday) return "Feriado";
    if (day.isUndefined) return "A definir";
    return day.meals.join("\n");
  }

  function getTextareaPlaceholder(day: DayMenu) {
    if (day.isHoliday) return "Feriado";
    if (day.isUndefined) return "A definir";
    return "Digite as refeições...";
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Editar cardápio"
      subtitle="Atualize o cardápio da semana"
      size="xl"
      footer={
        <div className={styles.footer}>
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
              Salvar
            </Button>
          </div>
        </div>
      }
    >
      <div className={styles.container}>
        {days.map(({ key, label }) => {
          const day = data[key];
          const isLocked = day.isHoliday || day.isUndefined;

          return (
            <div key={key} className={styles.dayCard}>
              <h3 className={styles.dayTitle}>{label}</h3>

              <textarea
                className={`${styles.textarea} ${
                  isLocked ? styles.textareaLocked : ""
                }`}
                value={getTextareaValue(day)}
                onChange={(e) =>
                  onChange(key, "meals", e.target.value.split("\n"))
                }
                disabled={isLocked}
                placeholder={getTextareaPlaceholder(day)}
              />

              <div className={styles.checkboxRow}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={day.isUndefined}
                    onChange={(e) =>
                      onChange(key, "isUndefined", e.target.checked)
                    }
                  />
                  <span>A definir</span>
                </label>

                <label className={styles.checkboxLabel}>
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
