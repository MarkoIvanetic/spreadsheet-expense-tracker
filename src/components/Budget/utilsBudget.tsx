export const getBadgeColor = (expense: number, limit: number) => {
  const percentage = (expense / limit) * 100;
  if (percentage < 50) {
    return "green";
  } else if (percentage < 75) {
    return "yellow";
  } else if (percentage < 100) {
    return "orange";
  } else {
    return "red";
  }
};
