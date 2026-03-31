
export const getTodayKey = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Calculates French public holidays for a given year
 */
const getFrenchHolidays = (year: number): string[] => {
  const holidays: string[] = [
    `${year}-01-01`, // Jour de l'an
    `${year}-05-01`, // Fête du travail
    `${year}-05-08`, // Victoire 1945
    `${year}-07-14`, // Fête nationale
    `${year}-08-15`, // Assomption
    `${year}-11-01`, // Toussaint
    `${year}-11-11`, // Armistice
    `${year}-12-25`, // Noël
  ];

  // Easter calculation (Meeus/Jones/Butcher algorithm)
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3=March, 4=April
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  const easterDate = new Date(year, month - 1, day);
  
  // Easter Monday
  const easterMonday = new Date(easterDate);
  easterMonday.setDate(easterDate.getDate() + 1);
  holidays.push(easterMonday.toISOString().split('T')[0]);

  // Ascension (Easter + 39 days)
  const ascension = new Date(easterDate);
  ascension.setDate(easterDate.getDate() + 39);
  holidays.push(ascension.toISOString().split('T')[0]);

  // Pentecost Monday (Easter + 50 days)
  const pentecostMonday = new Date(easterDate);
  pentecostMonday.setDate(easterDate.getDate() + 50);
  holidays.push(pentecostMonday.toISOString().split('T')[0]);

  return holidays;
};

const isBusinessDay = (date: Date): boolean => {
  const day = date.getDay(); // 0 = Sun, 6 = Sat
  if (day === 0 || day === 6) return false;

  const dateStr = date.toISOString().split('T')[0];
  const holidays = getFrenchHolidays(date.getFullYear());
  if (holidays.includes(dateStr)) return false;

  return true;
};

/**
 * Gets the last N business days (excluding weekends and French holidays)
 */
export const getPreviousDays = (count: number): string[] => {
  const dates: string[] = [];
  let checkedDate = new Date();
  
  while (dates.length < count) {
    checkedDate.setDate(checkedDate.getDate() - 1);
    const d = new Date(checkedDate);
    if (isBusinessDay(d)) {
      dates.push(d.toISOString().split('T')[0]);
    }
    
    // Safety break to prevent infinite loop if somehow count is huge
    if (dates.length > 365) break; 
  }
  return dates;
};

export const formatDateFr = (dateStr: string): string => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};
