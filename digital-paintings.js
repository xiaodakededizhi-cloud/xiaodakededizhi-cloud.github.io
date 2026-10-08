(function buildDigitalPaintingsArchive() {
  const root = document.querySelector("[data-digital-paintings-archive]");
  const archive = window.DIGITAL_PAINTINGS_ARCHIVE_DATA;
  const view = root ? root.closest("[data-view]") : null;

  if (!root || !archive || !Array.isArray(archive.records)) return;

  const fragment = document.createDocumentFragment();

  const fitImageToViewport = function (image) {
    if (image.naturalWidth <= 0 || image.naturalHeight <= 0) return;
    const figure = image.closest(".digital-painting-entry");
    const availableWidth = figure?.clientWidth || root.clientWidth;
    if (availableWidth <= 0) return;
    const captionAllowance = window.innerWidth <= 700 ? 124 : 86;
    const availableHeight = Math.max(1, window.innerHeight - captionAllowance);
    const aspect = image.naturalWidth / image.naturalHeight;
    image.style.width = `${Math.floor(Math.min(availableWidth, availableHeight * aspect))}px`;
  };

  archive.records.forEach((work, index) => {
    const figure = document.createElement("figure");
    figure.className = "painting-entry digital-painting-entry";

    const image = document.createElement("img");
    image.className = "painting-image";
    image.src = work.image;
    image.alt = `${work.title}, ${work.year}`;
    image.decoding = "async";
    image.loading = index === 0 ? "eager" : "lazy";
    if (work.bordered) image.classList.add("digital-painting-bordered");

    image.addEventListener("load", function () {
      fitImageToViewport(image);
    }, { once: true });

    const caption = document.createElement("figcaption");
    caption.className = "painting-caption";

    const title = document.createElement("p");
    title.textContent = `${work.title}, ${work.year}`;

    const medium = document.createElement("p");
    medium.textContent = work.medium;

    caption.append(title, medium);
    figure.append(image, caption);
    fragment.append(figure);
  });

  root.replaceChildren(fragment);

  const fitAllImages = function () {
    root.querySelectorAll(".painting-image").forEach(fitImageToViewport);
  };
  window.requestAnimationFrame(fitAllImages);
  window.addEventListener("resize", fitAllImages);

  if (view) {
    const visibilityObserver = new MutationObserver(function () {
      if (!view.hidden) {
        window.requestAnimationFrame(fitAllImages);
      }
    });

    visibilityObserver.observe(view, {
      attributes: true,
      attributeFilter: ["hidden"]
    });
  }
})();
