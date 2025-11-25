export function getDisplayStatus(game) {
  const isoString = game.startTimeUtc ? game.startTimeUtc : game.startTimeLocal;

  if (!isoString) {
    return "Unknown";
  }

  const startTime = new Date(isoString);
  const now = new Date();

  if (now < startTime) {
    return "Scheduled";
  }

  const threeHours = 3 * 60 * 60 * 1000;
  const endTime = new Date(startTime.getTime() + threeHours);

  if (now >= startTime && now <= endTime) {
    return "Live";
  }

  return "Final";
}