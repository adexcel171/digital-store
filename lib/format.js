export function formatCurrency(amount) {
  const currency = process.env.NEXT_PUBLIC_CURRENCY || "NGN";
  const locale = currency === "NGN" ? "en-NG" : "en-US";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
}
