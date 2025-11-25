export function getDomElements() {
  const loadingElement = document.getElementById("loading");
  const errorElement = document.getElementById("error");
  const upcomingElement = document.getElementById("upcoming-container");
  const finishedElement = document.getElementById("finished-container");

  return {
    loadingElement: loadingElement,
    errorElement: errorElement,
    upcomingElement: upcomingElement,
    finishedElement: finishedElement
  };
}