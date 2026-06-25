const EARTH_RADIUS_KM = 6371;

function degreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function calculateDistanceKm(
  startLatitude: number,
  startLongitude: number,
  endLatitude: number,
  endLongitude: number,
) {
  const latitudeDistance = degreesToRadians(endLatitude - startLatitude);
  const longitudeDistance = degreesToRadians(endLongitude - startLongitude);
  const startLatitudeInRadians = degreesToRadians(startLatitude);
  const endLatitudeInRadians = degreesToRadians(endLatitude);

  const haversineValue =
    Math.sin(latitudeDistance / 2) ** 2 +
    Math.cos(startLatitudeInRadians) *
      Math.cos(endLatitudeInRadians) *
      Math.sin(longitudeDistance / 2) ** 2;

  const centralAngle =
    2 * Math.atan2(Math.sqrt(haversineValue), Math.sqrt(1 - haversineValue));

  return EARTH_RADIUS_KM * centralAngle;
}
