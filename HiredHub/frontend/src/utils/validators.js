export const isEmail = (v) => /^\S+@\S+\.\S+$/.test(v.trim());

// 0 to 4, shown as a strength meter on sign-up
export const passwordStrength = (pw) => {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score += 1;
  return score;
};
