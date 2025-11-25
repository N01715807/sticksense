import { formatPublishedAt } from "../formatters/highlight.js";

export function createHighlightSection(highlight) {
  const container = document.createElement("div");
  container.className = "highlight-container";
  container.style.display = "none";

  const wrapper = document.createElement("div");
  wrapper.className = "highlight-video-wrapper";

  const iframe = document.createElement("iframe");
  iframe.src = "https://www.youtube.com/embed/" + highlight.videoId;
  iframe.allow =
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
  iframe.allowFullscreen = true;
  iframe.title = highlight.title ? highlight.title : "Game highlight";

  wrapper.appendChild(iframe);
  container.appendChild(wrapper);

  const metaSection = document.createElement("div");
  metaSection.className = "highlight-meta";

  const titleElement = document.createElement("div");
  titleElement.className = "highlight-meta-title";
  titleElement.textContent = "Title: " + highlight.title;

  const publishedElement = document.createElement("div");
  publishedElement.className = "highlight-meta-time";
  publishedElement.textContent =
    "Published At: " + formatPublishedAt(highlight.publishedAt);

  metaSection.appendChild(titleElement);
  metaSection.appendChild(publishedElement);
  container.appendChild(metaSection);

  return container;
}

export function createHighlightToggleButton() {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "highlight-toggle-btn";
  button.textContent = "Show Highlight ▼";

  return button;
}

export function attachHighlightToggle(button, container) {
  button.addEventListener("click", function () {
    const isHidden = container.style.display === "none";

    if (isHidden) {
      container.style.display = "block";
      button.textContent = "Hide Highlight ▲";
    } else {
      container.style.display = "none";
      button.textContent = "Show Highlight ▼";
    }
  });
}
