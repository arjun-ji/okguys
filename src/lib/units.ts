// Nepal land unit conversion, expressed in square feet (base unit).
// Hill system: Ropani - Aana - Paisa - Daam
// Terai system: Bigha - Kattha - Dhur
export type LandUnit =
  | "sqft"
  | "sqm"
  | "ropani"
  | "aana"
  | "paisa"
  | "daam"
  | "bigha"
  | "kattha"
  | "dhur";

export const SQFT_PER_UNIT: Record<LandUnit, number> = {
  sqft: 1,
  sqm: 10.76391,
  ropani: 5476,
  aana: 342.25,
  paisa: 85.5625,
  daam: 21.390625,
  bigha: 72900,
  kattha: 3645,
  dhur: 182.25,
};

export const LAND_UNITS: LandUnit[] = [
  "aana",
  "ropani",
  "paisa",
  "daam",
  "bigha",
  "kattha",
  "dhur",
  "sqft",
  "sqm",
];

export function toSquareFeet(value: number, unit: LandUnit): number {
  return value * SQFT_PER_UNIT[unit];
}

export function fromSquareFeet(sqft: number, unit: LandUnit): number {
  return sqft / SQFT_PER_UNIT[unit];
}

export function convertUnit(value: number, from: LandUnit, to: LandUnit): number {
  return fromSquareFeet(toSquareFeet(value, from), to);
}
