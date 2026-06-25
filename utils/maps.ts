export function createGoogleMapsDirectionsUrl(
  latitude: number,
  longitude: number,
  placeName: string,
) {
  const params = new URLSearchParams({
    api: "1",
    destination: `${placeName} ${latitude},${longitude}`,
  });

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
