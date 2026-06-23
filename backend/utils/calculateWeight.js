export const calculateVolumetricWeight = (length, width, height) => {
  if (!length || !width || !height) return 0.0;
  // Standard courier industry factor: Length * Width * Height / 5000 (cm -> kg)
  return (length * width * height) / 5000.0;
};
