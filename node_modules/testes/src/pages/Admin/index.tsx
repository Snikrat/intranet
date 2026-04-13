import { useState } from "react";
import styles from "./styles.module.css";
import { AdminSidebar } from "./components/AdminSideBar";
import { DashboardModule } from "./modules/DashboardModule";
import { SystemsModule } from "./modules/SystemsModule";
import { CampaignsModule } from "./modules/CampaignsModule";
import { CardapioModule } from "./modules/CardapioModule";
import { PopupModule } from "./modules/PopupModule";

import { ToastContainer } from "react-toastify";

export type AdminTab =
  | "dashboard"
  | "systems"
  | "campaigns"
  | "cardapio"
  | "popup";

export function Admin() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2500}
        closeOnClick
        pauseOnHover
        theme="light"
      />

      <main className={styles.page}>
        <AdminSidebar activeTab={activeTab} onChangeTab={setActiveTab} />

        <section className={styles.content}>
          {activeTab === "dashboard" && <DashboardModule />}
          {activeTab === "systems" && <SystemsModule />}
          {activeTab === "campaigns" && <CampaignsModule />}
          {activeTab === "cardapio" && <CardapioModule />}
          {activeTab === "popup" && <PopupModule />}
        </section>
      </main>
    </>
  );
}
