import type { SystemCard } from "./types";

export const initialSystems: SystemCard[] = [
  {
    id: 1,
    title: "Agendamento CGA",
    description: "Sistema de gestão de agendamentos de entregas cga.",
    icon: "calendar",
    link: "",
    order: 1,
    active: true,
  },
  {
    id: 2,
    title: "Sistema WMS",
    description: "Sistema de gestão logística e suprimentos.",
    icon: "boxes",
    link: "",
    order: 2,
    active: true,
  },
  {
    id: 3,
    title: "Webmail Outlook",
    description: "Ferramenta de comunicação oficial.",
    icon: "mail",
    link: "",
    order: 3,
    active: true,
  },
];

export const emptySystemForm = {
  title: "",
  description: "",
  icon: "calendar",
  order: 1,
  active: true,
};
