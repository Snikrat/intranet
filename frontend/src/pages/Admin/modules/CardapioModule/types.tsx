export type DayKey = "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta";

export type DayMenu = {
  items: string;
  isToDefine: boolean;
  isHoliday: boolean;
};

export type WeeklyMenuPayload = {
  active: boolean;
  days: Record<DayKey, DayMenu>;
};
