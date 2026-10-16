export const calculateRateValue = (weight, zone, slabList) => {
  const sortedSlabs = [...slabList].sort((a, b) => a.weightLimit - b.weightLimit);
  if (sortedSlabs.length === 0) return 0.0;
  
  const matchingSlab = sortedSlabs.find((s) => weight <= s.weightLimit);
  if (matchingSlab) {
    return matchingSlab[zone] || 0.0;
  }
  
  // Overweight surcharge multiplier
  const maxSlab = sortedSlabs[sortedSlabs.length - 1];
  if (maxSlab.weightLimit <= 0) return 0.0;
  const multiplier = weight / maxSlab.weightLimit;
  const baseRate = maxSlab[zone] || 0.0;
  return baseRate * multiplier;
};
