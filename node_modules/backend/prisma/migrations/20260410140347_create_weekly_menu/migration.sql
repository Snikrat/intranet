-- CreateTable
CREATE TABLE "WeeklyMenu" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "weekStart" DATETIME NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "segundaItems" TEXT,
    "segundaToDefine" BOOLEAN NOT NULL DEFAULT false,
    "segundaHoliday" BOOLEAN NOT NULL DEFAULT false,
    "tercaItems" TEXT,
    "tercaToDefine" BOOLEAN NOT NULL DEFAULT false,
    "tercaHoliday" BOOLEAN NOT NULL DEFAULT false,
    "quartaItems" TEXT,
    "quartaToDefine" BOOLEAN NOT NULL DEFAULT false,
    "quartaHoliday" BOOLEAN NOT NULL DEFAULT false,
    "quintaItems" TEXT,
    "quintaToDefine" BOOLEAN NOT NULL DEFAULT false,
    "quintaHoliday" BOOLEAN NOT NULL DEFAULT false,
    "sextaItems" TEXT,
    "sextaToDefine" BOOLEAN NOT NULL DEFAULT false,
    "sextaHoliday" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyMenu_weekStart_key" ON "WeeklyMenu"("weekStart");
