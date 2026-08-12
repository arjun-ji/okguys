// Format a number using the Nepali/Indian digit-grouping system (lakh, crore).
// e.g. 12345678 -> "1,23,45,678"
export function groupNepali(value: number): string {
  const isNegative = value < 0;
  const abs = Math.round(Math.abs(value));
  const str = String(abs);

  if (str.length <= 3) return (isNegative ? "-" : "") + str;

  const lastThree = str.slice(-3);
  const rest = str.slice(0, -3);
  const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");

  return (isNegative ? "-" : "") + grouped + "," + lastThree;
}

export function formatCurrency(value: number): string {
  if (!isFinite(value)) return "0";
  return `Rs. ${groupNepali(value)}`;
}

export function formatDecimal(value: number, decimals = 2): string {
  if (!isFinite(value)) return "0";
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}
