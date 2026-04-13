export function getWeekStart(date = new Date()): Date {
  const local = new Date(date);
  const day = local.getDay(); // 0 domingo, 1 segunda...
  const diffToMonday = day === 0 ? -6 : 1 - day;

  local.setHours(0, 0, 0, 0);
  local.setDate(local.getDate() + diffToMonday);

  return local;
}
