import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import styles from "./styles.module.css";

export type CustomSelectOption = {
  value: string;
  label: string;
};

type CustomSelectProps = {
  value: string;
  options: CustomSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  id?: string;
};

export function CustomSelect({
  value,
  options,
  onChange,
  placeholder = "Selecione",
  disabled = false,
  label,
  id,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleToggle() {
    if (disabled) return;
    setOpen((prev) => !prev);
  }

  function handleSelect(optionValue: string) {
    onChange(optionValue);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function handleButtonKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen((prev) => !prev);
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);

      requestAnimationFrame(() => {
        const firstItem = listRef.current?.querySelector("li button");
        (firstItem as HTMLButtonElement | null)?.focus();
      });
    }
  }

  function handleOptionKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    const optionButtons = listRef.current?.querySelectorAll("li button");
    if (!optionButtons || optionButtons.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = (index + 1) % optionButtons.length;
      (optionButtons[nextIndex] as HTMLButtonElement).focus();
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      const prevIndex =
        (index - 1 + optionButtons.length) % optionButtons.length;
      (optionButtons[prevIndex] as HTMLButtonElement).focus();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    }
  }

  return (
    <div className={styles.wrapper} ref={rootRef}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}

      <button
        id={id}
        ref={buttonRef}
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""} ${
          disabled ? styles.triggerDisabled : ""
        }`}
        onClick={handleToggle}
        onKeyDown={handleButtonKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
      >
        <span className={selectedOption ? styles.value : styles.placeholder}>
          {selectedOption?.label ?? placeholder}
        </span>

        <ChevronDown
          size={18}
          className={`${styles.icon} ${open ? styles.iconOpen : ""}`}
        />
      </button>

      {open && !disabled && (
        <ul className={styles.menu} role="listbox" ref={listRef}>
          {options.map((option, index) => {
            const isSelected = option.value === value;

            return (
              <li key={option.value}>
                <button
                  type="button"
                  className={`${styles.option} ${
                    isSelected ? styles.optionSelected : ""
                  }`}
                  onClick={() => handleSelect(option.value)}
                  onKeyDown={(event) => handleOptionKeyDown(event, index)}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check size={16} className={styles.check} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
