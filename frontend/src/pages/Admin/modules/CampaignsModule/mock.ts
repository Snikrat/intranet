import type { Campaign } from "./types";

export const initialCampaigns: Campaign[] = [
  {
    id: 1,
    title: "Febre Amarela",
    text: "A febre amarela é transmitida por mosquitos a pessoas não vacinadas em áreas de mata.",
    image: "/febre-amarela.jpg",
    order: 1,
    active: true,
  },
  {
    id: 2,
    title: "Conjuntivite",
    text: "Inflamação ou infecção da membrana externa do globo ocular.",
    image: "/conjuntivite.jpg",
    order: 2,
    active: true,
  },
];

export const emptyCampaignForm = {
  title: "",
  text: "",
  image: "",
  order: 1,
  active: true,
};
