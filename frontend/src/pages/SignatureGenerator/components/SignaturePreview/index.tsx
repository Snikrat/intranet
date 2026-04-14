import { companies } from "../../data/companies";
import { maskPhone } from "../../utils/maskPhone";
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
  signatureRef: React.RefObject<HTMLDivElement | null>;
};

export function SignaturePreview({ form, signatureRef }: Props) {
  const selectedCompany =
    companies.find((item) => item.id === form.company) ?? companies[0];

  const previewPhone = maskPhone(form.phone);

  return (
    <aside className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>pré-visualização</h2>
        <p className={styles.description}>
          veja como a assinatura vai ficar antes de baixar o png.
        </p>
      </div>

      <div className={styles.content}>
        <div className={styles.previewArea}>
          <div ref={signatureRef} className={styles.signatureCard}>
            <div
              className={styles.signatureBar}
              style={{ backgroundColor: selectedCompany.brand }}
            />

            <div className={styles.signatureContent}>
              <div className={styles.logoBox}>
                {selectedCompany.logo ? (
                  <img
                    src={selectedCompany.logo}
                    alt={selectedCompany.name}
                    className={styles.logoImage}
                  />
                ) : (
                  <div
                    className={styles.logoFallback}
                    style={{ backgroundColor: selectedCompany.brand }}
                  >
                    {selectedCompany.logoText}
                  </div>
                )}
              </div>

              <div
                className={styles.info}
                style={{ borderColor: selectedCompany.brand }}
              >
                <p className={styles.name} title={form.fullName || "Seu nome"}>
                  {form.fullName || "Seu nome"}
                </p>

                <p
                  className={styles.role}
                  style={{ color: selectedCompany.brand }}
                  title={form.role || "Seu cargo"}
                >
                  {form.role || "Seu cargo"}
                </p>

                <div className={styles.contactList}>
                  <p>{previewPhone || "(00) 00000-0000"}</p>
                  <p className={styles.emailText}>
                    {form.email || "seuemail@empresa.com"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.miniCard}>
          <p className={styles.miniLabel}>miniatura</p>

          <div className={styles.miniPreview}>
            <div className={styles.miniLogo}>
              {selectedCompany.logo ? (
                <img
                  src={selectedCompany.logo}
                  alt={selectedCompany.name}
                  className={styles.miniLogoImage}
                />
              ) : (
                <div
                  className={styles.miniLogoFallback}
                  style={{ backgroundColor: selectedCompany.brand }}
                >
                  {selectedCompany.logoText}
                </div>
              )}
            </div>

            <div
              className={styles.miniInfo}
              style={{ borderColor: selectedCompany.brand }}
            >
              <div
                className={styles.miniName}
                title={form.fullName || "Seu nome"}
              >
                {form.fullName || "Seu nome"}
              </div>

              <div
                className={styles.miniRole}
                style={{ color: selectedCompany.brand }}
                title={form.role || "Seu cargo"}
              >
                {form.role || "Seu cargo"}
              </div>

              <div className={styles.miniText}>
                {previewPhone || "Telefone"}
              </div>
              <div className={styles.miniText} title={form.email || "E-mail"}>
                {form.email || "E-mail"}
              </div>
            </div>
          </div>
        </div>

        <div
          className={styles.infoBox}
          style={{ backgroundColor: selectedCompany.soft }}
        >
          <p className={styles.infoTitle}>dica para uso no e-mail</p>

          <div className={styles.infoList}>
            <p>• prefira nomes e cargos curtos para manter boa leitura</p>
            <p>
              • o png é prático, mas no outlook o ideal é testar o tamanho antes
            </p>
            <p>
              • confirme se o telefone está com ddd e se o e-mail está correto
            </p>
            <p>
              • depois de baixar, use sempre a mesma assinatura para manter o
              padrão
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
