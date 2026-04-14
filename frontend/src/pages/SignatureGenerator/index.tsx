import { useRef, useState } from "react";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";

import styles from "./styles.module.css";
import { SignatureHero } from "./components/SignatureHero";
import { SignatureForm } from "./components/SignatureForm";
import { SignaturePreview } from "./components/SignaturePreview";

type FormData = {
  fullName: string;
  company: string;
  role: string;
  email: string;
  phone: string;
};

function SignatureGeneratorPage() {
  const signatureRef = useRef<HTMLDivElement | null>(null);

  const [form, setForm] = useState<FormData>({
    fullName: "",
    company: "pvax",
    role: "",
    email: "",
    phone: "",
  });

  function handleChange<K extends keyof FormData>(
    field: K,
    value: FormData[K],
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  return (
    <>
      <Header />

      <main className={styles.page}>
        <SignatureHero />

        <div className={styles.contentContainer}>
          <section className={styles.content}>
            <SignatureForm
              form={form}
              onChange={handleChange}
              signatureRef={signatureRef}
            />

            <SignaturePreview form={form} signatureRef={signatureRef} />
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default SignatureGeneratorPage;
