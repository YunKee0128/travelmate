export function formatTravelDateRange(startDate: string, endDate: string) {
  return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
}

function formatDate(date: string) {
  return date.replaceAll("-", ".");
}
