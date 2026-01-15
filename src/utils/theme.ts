export const getTimeBasedTheme = (): string => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 24) return 'evening';
  return 'night';
};

export const applyTheme = (theme: string): void => {
  document.body.className = `theme-${theme}`;
};

// Apply theme on initial load and when time changes
export const initializeTheme = (): void => {
  const currentTheme = getTimeBasedTheme();
  applyTheme(currentTheme);
  
  // Update theme every minute to catch time transitions
  setInterval(() => {
    const newTheme = getTimeBasedTheme();
    applyTheme(newTheme);
  }, 60000);
};
