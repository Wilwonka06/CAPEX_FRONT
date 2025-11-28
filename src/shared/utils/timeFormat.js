export function to24h(time12) {
  if (!time12) return '';
  const [time, meridian] = time12.trim().split(/\s+/);
  let [hh, mm] = time.split(':').map(Number);
  const isPM = /pm/i.test(meridian);
  const isAM = /am/i.test(meridian);
  if (isPM && hh < 12) hh += 12;
  if (isAM && hh === 12) hh = 0;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export function to12h(time24) {
  if (!time24) return '';
  const [hhStr, mmStr] = time24.split(':');
  let hh = Number(hhStr);
  const meridian = hh >= 12 ? 'PM' : 'AM';
  hh = hh % 12;
  if (hh === 0) hh = 12;
  return `${String(hh).padStart(2, '0')}:${mmStr} ${meridian}`;
}

export const HOURS_12 = [
  '01:00 AM','02:00 AM','3:00 AM','04:00 AM','05:00 AM','06:00 AM','07:00 AM','08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM',
  '01:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM','06:00 PM','07:00 PM','08:00 PM','09:00 PM','10:00 PM'
];