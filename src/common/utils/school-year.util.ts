export function getCurrentSchoolYear(): string {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0 = January

  // Determine the base school year
  // If current month is May (4) or later, we're in the school year that started last calendar year
  // Calculate the school year range
  const startYear = currentMonth >= 4 ? currentYear : currentYear - 1;
  const endYear = startYear + 1;

  return `${startYear}-${endYear}`;
}

