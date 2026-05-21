export const slugify = (str) => {
  if (!str) return '';
  // Remove spaces, punctuation, and parentheses
  return str.replace(/[^a-zA-Z0-9]/g, '');
};
