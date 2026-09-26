const compatibleDestinations = {
  Mohakhali: ["Mohakhali", "Gulshan 1"],
  "Gulshan 1": ["Gulshan 1", "Mohakhali"],
};

export const canShareRoute = (existingRequest, newRequest) => {
  if (existingRequest.pickupArea !== newRequest.pickupArea) {
    return false;
  }

  const allowedDestinations =
    compatibleDestinations[existingRequest.destinationArea] || [];

  return allowedDestinations.includes(newRequest.destinationArea);
};

