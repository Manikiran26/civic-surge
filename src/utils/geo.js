export function haversineKm(lat1, lng1, lat2, lng2) {
  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(a));
}

export function formatDistanceKm(value) {
  if (!Number.isFinite(value)) return "";
  if (value < 1) {
    return `${Math.round(value * 1000)}m`;
  }
  return `${value.toFixed(1)}km`;
}
