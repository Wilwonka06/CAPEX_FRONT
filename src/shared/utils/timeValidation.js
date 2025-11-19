export function isFutureTimeToday(dateISO, timeHHMM) {
  const today = new Date().toISOString().slice(0,10);
  if (dateISO !== today) return true;
  if (!/^\d{2}:\d{2}$/.test(timeHHMM)) return false;
  const [hh, mm] = timeHHMM.split(':').map(Number);
  const now = new Date();
  const nowMin = now.getHours()*60 + now.getMinutes();
  const tMin = hh*60 + mm;
  return tMin > nowMin;
}

export function nearestWarning(dateISO, timeHHMM, windowMin = 30) {
  const today = new Date().toISOString().slice(0,10);
  if (dateISO !== today) return false;
  if (!/^\d{2}:\d{2}$/.test(timeHHMM)) return false;
  const [hh, mm] = timeHHMM.split(':').map(Number);
  const now = new Date();
  const nowMin = now.getHours()*60 + now.getMinutes();
  const tMin = hh*60 + mm;
  return tMin - nowMin <= windowMin && tMin - nowMin > 0;
}