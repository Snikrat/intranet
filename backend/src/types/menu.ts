export type DayKey = "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta";

export type DayMenu = {
  items: string;
  isToDefine: boolean;
  isHoliday: boolean;
};

export type WeeklyMenuBody = {
  active?: boolean;
  days?: Record<DayKey, DayMenu>;
};

export type WeeklyMenuResponse = {
  active: boolean;
  days: Record<DayKey, DayMenu>;
};
