export function calculateCropProfit({
  quantityKg = 1000,
  modalPrice = 2280,
  distanceKm = 25,
  commissionPercent = 2
}) {
  const quintals = Number(quantityKg) / 100;
  const price = Number(modalPrice);
  const distance = Number(distanceKm) || 25;

  const grossRevenue = Math.round(quintals * price);
  const transportCost = Math.max(300, Math.round(distance * 20 * (quintals / 10)));
  const handlingCost = Math.round(150 + quintals * 15);
  const commission = Math.round((grossRevenue * (commissionPercent || 2)) / 100);
  const totalDeductions = transportCost + handlingCost + commission;
  const netReturn = Math.max(0, grossRevenue - totalDeductions);

  return {
    quantityKg: Number(quantityKg),
    quintals: Number(quintals.toFixed(2)),
    modalPrice: price,
    distanceKm: distance,
    grossRevenue,
    transportCost,
    handlingCost,
    commission,
    totalDeductions,
    netReturn
  };
}

export default calculateCropProfit;
