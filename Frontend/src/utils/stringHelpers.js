// Get user initial (first letter of username)
export const getUserInitial = (username) => {
  if (!username || typeof username !== 'string') return '';
  return username.slice(0, 1).toUpperCase();
};

// Capitalize first letter of a string
export const capitalizeFirstLetter = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Format string to title case (capitalize first letter of each word)
export const toTitleCase = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};
