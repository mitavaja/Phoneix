export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone) => {
  if (!phone) return false;
  // Allows exactly 10 digits
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
};

export const isValidPassword = (password) => {
  if (!password) return false;
  if (password.length < 8 || password.length > 64) return false;
  if (/\s/.test(password)) return false; // no spaces allowed
  
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return hasUpper && hasLower && hasNumber && hasSpecial;
};

export const checkPasswordStrength = (password) => {
  if (!password) return "";
  if (!isValidPassword(password)) return "Weak";
  if (password.length > 12) return "Strong";
  return "Medium";
};
