(function buildPaintingsArchive() {
  const root = document.querySelector("[data-paintings-archive]");
  const archive = window.PAINTINGS_ARCHIVE_DATA;

  if (!root || !archive || !Array.isArray(archive.records)) return;

  const fragment = document.createDocumentFragment();

  archive.records.forEach((work, index) => {
    const figure = document.createElement("figure");
    figure.className = `painting-entry painting-size-${work.sizeClass.toLowerCase()}`;

    const image = document.createElement("img");
    image.className = "painting-image";
    image.src = work.image;
    image.alt = `${work.title}, ${work.year}`;
    image.decoding = "async";
    image.loading = index === 0 ? "eager" : "lazy";

    const caption = document.createElement("figcaption");
    caption.className = "painting-caption";

    const title = document.createElement("p");
    title.textContent = `${work.title}, ${work.year}`;

    const details = document.createElement("p");
    details.textContent = `${work.medium}, ${work.dimensions}`;

    caption.append(title, details);
    figure.append(image, caption);
    fragment.append(figure);
  });

  root.replaceChildren(fragment);
})();
