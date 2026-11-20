document.documentElement.classList.add("motion-ready");

const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  },
  { rootMargin: "0px 0px -7%", threshold: 0.1 },
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox.querySelector("img");
const lightboxCaption = lightbox.querySelector("p");
const lightboxClose = lightbox.querySelector(".lightbox-close");

document.addEventListener("click", (event) => {
  const figure = event.target.closest("[data-lightbox]");
  if (!figure) return;

  const sourceImage = figure.querySelector("img");
  const sourceCaption = figure.querySelector("figcaption");
  lightboxImage.src = sourceImage.currentSrc || sourceImage.src;
  lightboxImage.alt = sourceImage.alt;
  lightboxCaption.textContent = sourceCaption?.textContent.trim() || sourceImage.alt;
  lightbox.showModal();
  lightboxClose.focus();
});

function closeLightbox() {
  lightbox.close();
  lightboxImage.removeAttribute("src");
}

lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});
