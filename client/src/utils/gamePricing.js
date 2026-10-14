
export function getDemoPrice(id) {
  const tiers = [499, 799, 999, 1299, 1499, 1999];

  const numericId = Number(id);

  const index = Number.isFinite(numericId)
    ? Math.abs(numericId) % tiers.length
    : 0;

  return tiers[index];
}

export function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);
}
