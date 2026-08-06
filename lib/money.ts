// Money formatting helpers — shared across server and client components.
// Maps a product's `currency` string to a symbol and formats the value.
// (₹ uses Indian digit grouping via en-IN; other currencies use en-US.)

export function moneySymbol(currency: string) {
  if (!currency) return "₹";
  const c = currency.toUpperCase();
  if (c === "USD" || c === "US" || c === "DOLLAR") return "$";
  if (c === "EUR") return "€";
  if (c === "GBP") return "£";
  return "₹";
}

export function formatMoney(value: number, currency: string) {
  const sym = moneySymbol(currency);
  if (sym === "₹") return `₹${value.toLocaleString("en-IN")}`;
  return `${sym}${value.toLocaleString("en-US")}`;
}
