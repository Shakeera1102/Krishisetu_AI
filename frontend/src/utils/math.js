// Mathematical functions for agricultural economics

/**
 * Calculates net profit for a farmer based on crop quantity, price per quintal, and expense breakdown
 * @param {Object} params 
 * @returns {Object} Net return breakdown
 */
export const calculateNetReturn = ({
  quantityKg = 1000,
  pricePerQuintal = 3200,
  transportCost = 900,
  handlingCost = 300,
  storageCost = 200,
  commissionPercent = 2,
  miscCost = 100
}) => {
  const quintals = quantityKg / 100;
  const grossRevenue = quintals * pricePerQuintal;
  
  const commissionCost = (grossRevenue * commissionPercent) / 100;
  const totalExpenses = transportCost + handlingCost + storageCost + commissionCost + miscCost;
  const netReturn = grossRevenue - totalExpenses;
  
  const profitPerKg = netReturn / quantityKg;
  const profitPerQuintal = profitPerKg * 100;
  const roiPercent = totalExpenses > 0 ? (netReturn / totalExpenses) * 100 : 0;

  return {
    quintals,
    grossRevenue,
    expenses: {
      transportCost,
      handlingCost,
      storageCost,
      commissionCost,
      miscCost,
      totalExpenses
    },
    netReturn,
    profitPerKg,
    profitPerQuintal,
    roiPercent
  };
};
