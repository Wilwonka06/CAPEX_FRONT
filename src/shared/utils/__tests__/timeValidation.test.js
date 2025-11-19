import { describe, it, expect } from 'vitest';
import { isFutureTimeToday, nearestWarning } from '../timeValidation';

describe('timeValidation', () => {
  it('rejects past times today', () => {
    const dateISO = new Date().toISOString().slice(0,10);
    const past = '00:00';
    expect(isFutureTimeToday(dateISO, past)).toBe(false);
  });
  it('accepts future times today', () => {
    const dateISO = new Date().toISOString().slice(0,10);
    const now = new Date();
    const hh = String((now.getHours()+1)%24).padStart(2,'0');
    const mm = String(now.getMinutes()).padStart(2,'0');
    expect(isFutureTimeToday(dateISO, `${hh}:${mm}`)).toBe(true);
  });
  it('warns for near window', () => {
    const dateISO = new Date().toISOString().slice(0,10);
    const now = new Date();
    const hh = String(now.getHours()).padStart(2,'0');
    const mm = String((now.getMinutes()+15)%60).padStart(2,'0');
    expect(nearestWarning(dateISO, `${hh}:${mm}`, 30)).toBe(true);
  });
});