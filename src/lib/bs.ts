import NepaliDate, { dateConfigMap } from "nepali-date-converter";

export const BS_MONTH_KEYS = [
  "Baisakh",
  "Jestha",
  "Asar",
  "Shrawan",
  "Bhadra",
  "Aswin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
] as const;

export const BS_AVAILABLE_YEARS = Object.keys(dateConfigMap)
  .map(Number)
  .sort((a, b) => a - b);
export const BS_MIN_YEAR = BS_AVAILABLE_YEARS[0];
export const BS_MAX_YEAR = BS_AVAILABLE_YEARS[BS_AVAILABLE_YEARS.length - 1];

export function daysInBsMonth(year: number, monthIndex: number): number {
  return dateConfigMap[String(year)]?.[BS_MONTH_KEYS[monthIndex]] ?? 30;
}

/** Current B.S. month as a "YYYY-MM" key (1-indexed month, like the native AD month input). */
export function currentBsMonthKey(): string {
  const now = NepaliDate.now();
  return `${now.getYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function parseBsMonthKey(key: string): { year: number; month: number } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(key);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]) - 1 };
}

export function bsMonthKey(year: number, monthIndex: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

/** Formats a "YYYY-MM" B.S. month key as e.g. "Shrawan 2083" / "श्रावण २०८३". */
export function formatBsMonthLabel(key: string, lang: "en" | "ne"): string {
  const parsed = parseBsMonthKey(key);
  if (!parsed) return key;
  return new NepaliDate(parsed.year, parsed.month, 1).format("MMMM YYYY", lang === "ne" ? "np" : "en");
}
