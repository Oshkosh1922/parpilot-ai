const round = (value) => Math.round(Number(value || 0));
export function estimateAnnualValue(input = {}) {
  const annualSales = Math.max(0, Number(input.annualSales || 1200000));
  const foodSavings = round(annualSales * 0.015);
  const laborSavings = round(annualSales * 0.009);
  const guestGrowth = round(annualSales * 0.012);
  return { annualSales, foodSavings, laborSavings, guestGrowth, total: foodSavings + laborSavings + guestGrowth, assumptions: ["1.5% purchasing and waste opportunity", "0.9% labor and operating opportunity", "1.2% guest-retention and demand opportunity"] };
}
