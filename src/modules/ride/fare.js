const BASE_FARE_PAISA = 5000;
const PER_KM_PAISA = 2000;
const POOL_DISCOUNT_PAISA = 2000;

export const calculateFare = (distanceKm) => {
  const fare =
    BASE_FARE_PAISA +
    distanceKm * PER_KM_PAISA -
    POOL_DISCOUNT_PAISA;

  return fare;
};