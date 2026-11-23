import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Currency symbol and display mapping for African and international currencies
 */
const CURRENCY_SYMBOLS: Record<string, string> = {
  XOF: "FCFA",
  XAF: "FCFA",
  GNF: "FG",
  CDF: "FC",
  MAD: "DH",
  EUR: "€",
  USD: "$",
};

/**
 * Format monetary amounts stored as minor units (integers).
 * Never uses floating point math for financial sums.
 */
export function formatCurrency(
  minorUnits: number,
  currencyCode: string = "XOF",
  decimals: number = 0
): string {
  const code = currencyCode.toUpperCase();
  const symbol = CURRENCY_SYMBOLS[code] || code;

  if (decimals === 0) {
    // Integer currency (e.g. CFA Francs, Guinean Francs)
    const formatted = new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: 0,
    }).format(minorUnits);
    return `${formatted} ${symbol}`;
  }

  // Decimals currency (e.g. EUR, USD)
  const divisor = Math.pow(10, decimals);
  const major = minorUnits / divisor;
  const formatted = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(major);

  return `${formatted} ${symbol}`;
}

/**
 * Format dates with localized French labels
 */
export function formatDate(dateString: string): string {
  if (!dateString) return "—";
  try {
    const [year, month, day] = dateString.split("-").map(Number);
    if (!year || !month || !day) return dateString;
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Return French human status description and badge variant
 */
export function getStatusDetails(status: "settled" | "overdue" | "due_soon" | "up_to_date") {
  switch (status) {
    case "settled":
      return {
        label: "Soldé",
        variant: "success" as const,
        description: "Aucun solde dû",
        className: "bg-[#0CA770]/10 text-[#0CA770] border-[#0CA770]/30",
      };
    case "overdue":
      return {
        label: "En retard",
        variant: "destructive" as const,
        description: "Échéance dépassée",
        className: "bg-red-50 text-red-700 border-red-200",
      };
    case "due_soon":
      return {
        label: "Bientôt dû",
        variant: "warning" as const,
        description: "Échéance dans moins de 3 jours",
        className: "bg-amber-50 text-amber-800 border-amber-200",
      };
    case "up_to_date":
    default:
      return {
        label: "À jour",
        variant: "default" as const,
        description: "Crédit en cours sans retard",
        className: "bg-[#B4F5D8]/40 text-[#0F2327] border-[#0CA770]/20",
      };
  }
}
