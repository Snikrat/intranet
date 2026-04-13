-- CreateTable
CREATE TABLE "Popup" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "showOnce" BOOLEAN NOT NULL DEFAULT false,
    "closeOnlyOnButton" BOOLEAN NOT NULL DEFAULT false,
    "autoCloseSeconds" INTEGER,
    "displayType" TEXT NOT NULL DEFAULT 'modal',
    "position" TEXT NOT NULL DEFAULT 'top-right',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
