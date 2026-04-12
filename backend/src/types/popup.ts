export type PopupDisplayType = "modal" | "floating";

export type PopupPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "bottom-center";

export type CreateOrUpdatePopupBody = {
  title?: string;
  message?: string;
  active?: boolean;
  showOnce?: boolean;
  closeOnlyOnButton?: boolean;
  autoCloseSeconds?: number | null;
  displayType?: PopupDisplayType;
  position?: PopupPosition;
};
