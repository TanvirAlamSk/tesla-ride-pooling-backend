const routeDistances = {
  "Banani-Mohakhali": 5,
  "Banani-Gulshan 1": 4,
};

export const getRouteDistance = (pickupArea, destinationArea) => {
  const key = `${pickupArea}-${destinationArea}`;

  return routeDistances[key] ?? null;
};