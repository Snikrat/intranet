import { useState } from "react";
import { ImageDown, Mail, Phone, User, Briefcase } from "lucide-react";
import { toPng } from "html-to-image";

import { companies } from "../../data/companies";
import { sanitizeFileName } from "../../utils/sanitizeFileName";
import { maskPhone } from "../../utils/maskPhone";
import { CustomSelect } from "../../../../components/CustomSelect";

import styles from "./styles.module.css";

type FormData = {
  fullName: string;
  company: string;
  role: string;
  email: string;
  phone: string;
};

type Props = {
  form: FormData;
  onChange: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  signatureRef: React.RefObject<HTMLDivElement | null>;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

export function SignatureForm({ form, onChange, signatureRef }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const companyOptions = companies.map((c) => ({
    label: c.name,
    value: c.id,
  }));

  function validateForm(values: FormData) {
    const nextErrors: FormErrors = {};

    if (!values.fullName.trim()) nextErrors.fullName = "Informe o nome.";
    if (!values.company) nextErrors.company = "Selecione a empresa.";
    if (!values.role.trim()) nextErrors.role = "Informe o cargo.";

    if (!values.email.trim()) {
      nextErrors.email = "Informe o e-mail.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      nextErrors.email = "E-mail inválido.";
    }

    const phoneDigits = values.phone.replace(/\D/g, "");
    if (!phoneDigits) {
      nextErrors.phone = "Informe o telefone.";
    } else if (phoneDigits.length < 10) {
      nextErrors.phone = "Telefone inválido.";
    }

    return nextErrors;
  }

  function handleFieldChange<K extends keyof FormData>(
    field: K,
    value: FormData[K],
  ) {
    onChange(field, value);

    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleDownload() {
    if (!signatureRef.current) return;

    const validation = validateForm(form);
    setErrors(validation);

    if (Object.keys(validation).length > 0) return;

    try {
      setDownloading(true);

      const selectedCompany =
        companies.find((item) => item.id === form.company) ?? companies[0];

      const dataUrl = await toPng(signatureRef.current, {
        pixelRatio: 3,
        backgroundColor: "#fff",
      });

      const link = document.createElement("a");
      link.download = `${sanitizeFileName(form.fullName)}-${selectedCompany.name.toLowerCase()}-assinatura.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Erro ao gerar PNG da assinatura:", error);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Dados da assinatura</h2>
        <p className={styles.description}>
          Preencha os campos abaixo e acompanhe o resultado ao lado.
        </p>
      </div>

      <div className={styles.content}>
        <div className={styles.field}>
          <span className={styles.label}>Nome completo</span>

          <div
            className={`${styles.inputWrapper} ${
              errors.fullName ? styles.error : ""
            }`}
          >
            <User size={18} className={styles.icon} />
            <input
              value={form.fullName}
              onChange={(e) => handleFieldChange("fullName", e.target.value)}
              className={styles.input}
              placeholder="Digite seu nome"
            />
          </div>

          <span className={styles.errorText}>{errors.fullName || ""}</span>
        </div>

        <div className={styles.grid}>
          <div className={styles.field}>
            <span className={styles.label}>Empresa</span>

            <div className={errors.company ? styles.selectError : ""}>
              <CustomSelect
                options={companyOptions}
                value={form.company}
                onChange={(value: string) =>
                  handleFieldChange("company", value)
                }
              />
            </div>

            <span className={styles.errorText}>{errors.company || ""}</span>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Cargo</span>

            <div
              className={`${styles.inputWrapper} ${
                errors.role ? styles.error : ""
              }`}
            >
              <Briefcase size={18} className={styles.icon} />
              <input
                value={form.role}
                onChange={(e) => handleFieldChange("role", e.target.value)}
                className={styles.input}
                placeholder="Seu cargo"
              />
            </div>

            <span className={styles.errorText}>{errors.role || ""}</span>
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.field}>
            <span className={styles.label}>E-mail</span>

            <div
              className={`${styles.inputWrapper} ${
                errors.email ? styles.error : ""
              }`}
            >
              <Mail size={18} className={styles.icon} />
              <input
                value={form.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                className={styles.input}
                placeholder="Digite seu e-mail"
              />
            </div>

            <span className={styles.errorText}>{errors.email || ""}</span>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Telefone</span>

            <div
              className={`${styles.inputWrapper} ${
                errors.phone ? styles.error : ""
              }`}
            >
              <Phone size={18} className={styles.icon} />
              <input
                value={maskPhone(form.phone)}
                onChange={(e) => handleFieldChange("phone", e.target.value)}
                className={styles.input}
                placeholder="Digite seu telefone"
              />
            </div>

            <span className={styles.errorText}>{errors.phone || ""}</span>
          </div>
        </div>

        <button
          onClick={handleDownload}
          className={styles.button}
          disabled={downloading}
        >
          <ImageDown size={18} />
          {downloading ? "gerando..." : "Baixar assinatura"}
        </button>
      </div>
    </section>
  );
}
