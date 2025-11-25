export function formatPublishedAt(isoString) {
  if (!isoString) {
    return "";
  }

  const date = new Date(isoString);
  const formatted = date.toLocaleString("en-CA");

  return formatted;
}