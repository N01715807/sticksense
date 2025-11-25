export function formatVenue(venue) {
  if (!venue) {
    return "";
  }

  const name = venue.name ? venue.name : "";
  const city = venue.city ? venue.city : "";

  if (name && city) {
    return name + " · " + city;
  }

  return name || city;
}