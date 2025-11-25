export function formatGameTime(isoString) {
  if (!isoString) {
    return "";
  }

  const date = new Date(isoString);

  const timeString = date.toLocaleTimeString("en-CA", {
    hour: "numeric",
    minute: "2-digit"
  });

  const hour = date.getHours();
  const isEvening = hour >= 18;
  const prefix = isEvening ? "Tonight" : "Today";

  return prefix + " " + timeString;
}