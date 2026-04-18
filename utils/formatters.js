export function formatCOP(value) {
  if (value === null || value === undefined || value === "") return "$0";

  const number = Number(value);
  if (!Number.isFinite(number)) return "$0";

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(number);
}

export function percent(value) {
  if (value === null || value === undefined || value === "") return "0%";

  const number = Number(value);
  if (!Number.isFinite(number)) return "0%";

  return `${(number * 100).toFixed(2)}%`;
}

export function formatNumberInput(value) {
  if (value === null || value === undefined || value === "") return "";

  const raw = String(value).replace(/[^\d]/g, "");
  if (!raw) return "";

  return new Intl.NumberFormat("es-CO").format(Number(raw));
}

export function sanitizeNumericInput(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[^\d]/g, "");
}