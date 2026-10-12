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

const bookTool = document.querySelector("[data-book-tool]");
const bookStage = document.querySelector("[data-book-stage]");
const leftImage = document.querySelector("[data-book-left]");
const rightImage = document.querySelector("[data-book-right]");
const underLeftImage = document.querySelector("[data-book-under-left]");
const underRightImage = document.querySelector("[data-book-under-right]");
const previousButton = document.querySelector("[data-book-prev]");
const nextButton = document.querySelector("[data-book-next]");
const currentLabel = document.querySelector("[data-book-current]");
const pageRange = document.querySelector("[data-book-range]");
const fullscreenButton = document.querySelector("[data-book-fullscreen]");
const modeButtons = [...document.querySelectorAll("[data-book-mode]")];
const totalLabel = document.querySelector("[data-book-total]");
const spreadCount = 21;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobileReadingQuery = window.matchMedia("(max-width: 720px)");

const singlePages = [{ spread: 1, side: "right" }];
for (let spread = 2; spread < spreadCount; spread += 1) {
  singlePages.push({ spread, side: "left" }, { spread, side: "right" });
}
singlePages.push({ spread: spreadCount, side: "right" });

let currentSpread = 1;
let currentSingleIndex = 0;
let readingMode = mobileReadingQuery.matches ? "single" : "spread";
let userSelectedReadingMode = false;
let isTurning = false;
let pointerStartX = null;
let bookIsVisible = false;

function pageSource(spread, side) {
  return `assets/book-final/spread-${String(spread).padStart(2, "0")}-${side}.jpg`;
}

function halfIsHidden(spread, side) {
  return side === "left" && (spread === 1 || spread === spreadCount);
}

function preloadNearby() {
  const sources = [];

  if (readingMode === "single") {
    for (const index of [currentSingleIndex - 1, currentSingleIndex + 1]) {
      const page = singlePages[index];
      if (page) sources.push(pageSource(page.spread, page.side));
    }
  } else {
    for (const spread of [currentSpread - 1, currentSpread + 1]) {
      if (spread < 1 || spread > spreadCount) continue;
      sources.push(pageSource(spread, "left"), pageSource(spread, "right"));
    }
  }

  for (const source of sources) {
    const image = new Image();
    image.src = source;
  }
}

function updateBookUI() {
  const isSingle = readingMode === "single";
  const current = isSingle ? currentSingleIndex + 1 : currentSpread;
  const total = isSingle ? singlePages.length : spreadCount;

  currentLabel.textContent = String(current).padStart(2, "0");
  totalLabel.textContent = String(total);
  pageRange.max = String(total);
  pageRange.value = String(current);
  previousButton.disabled = current === 1;
  nextButton.disabled = current === total;
  modeButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.bookMode === readingMode));
  });
  preloadNearby();
}

function setSpreadImages(spread) {
  const leftSource = pageSource(spread, "left");
  const rightSource = pageSource(spread, "right");
  leftImage.src = leftSource;
  rightImage.src = rightSource;
  underLeftImage.src = leftSource;
  underRightImage.src = rightSource;
  leftImage.hidden = halfIsHidden(spread, "left");
  rightImage.hidden = halfIsHidden(spread, "right");
  underLeftImage.hidden = halfIsHidden(spread, "left");
  underRightImage.hidden = halfIsHidden(spread, "right");
  leftImage.alt = `TASK³ 视觉画册第 ${spread} 个跨页左页`;
  rightImage.alt = `TASK³ 视觉画册第 ${spread} 个跨页右页`;
}

function setSinglePageImages(index) {
  const page = singlePages[index];
  const source = pageSource(page.spread, page.side);
  leftImage.src = source;
  underLeftImage.src = source;
  leftImage.hidden = false;
  underLeftImage.hidden = false;
  rightImage.hidden = true;
  underRightImage.hidden = true;
  leftImage.alt = `TASK³ 视觉画册第 ${index + 1} 页`;
  rightImage.alt = "";
}

function setSpreadImmediately(spread) {
  currentSpread = spread;
  setSpreadImages(spread);
  updateBookUI();
}

function applyReadingMode(mode) {
  if (isTurning || !["spread", "single"].includes(mode)) return;

  if (mode === "single" && readingMode !== "single") {
    const matchingIndex = singlePages.findIndex((page) => page.spread === currentSpread);
    currentSingleIndex = Math.max(0, matchingIndex);
  }

  if (mode === "spread" && readingMode === "single") {
    currentSpread = singlePages[currentSingleIndex].spread;
  }

  readingMode = mode;
  bookStage.classList.toggle("is-single-page", readingMode === "single");
  if (readingMode === "single") setSinglePageImages(currentSingleIndex);
  else setSpreadImages(currentSpread);
  updateBookUI();
}

function createTurningSheet(direction, frontSource, backSource) {
  const turningSheet = document.createElement("div");
  turningSheet.className = `turning-sheet ${direction}`;
  turningSheet.setAttribute("aria-hidden", "true");

  for (const [faceName, source] of [["front", frontSource], ["back", backSource]]) {
    const face = document.createElement("div");
    face.className = `page-face ${faceName}`;
    const image = document.createElement("img");
    image.src = source;
    image.alt = "";
    face.append(image);
    turningSheet.append(face);
  }

  return turningSheet;
}

function turnTo(spread, direction) {
  if (isTurning || spread === currentSpread || spread < 1 || spread > spreadCount) return;

  if (reducedMotion.matches) {
    setSpreadImmediately(spread);
    return;
  }

  isTurning = true;
  const incomingLeft = pageSource(spread, "left");
  const incomingRight = pageSource(spread, "right");
  underLeftImage.src = incomingLeft;
  underRightImage.src = incomingRight;
  underLeftImage.hidden = halfIsHidden(spread, "left");
  underRightImage.hidden = halfIsHidden(spread, "right");

  const isNext = direction === "next";
  const frontSource = isNext ? rightImage.src : leftImage.src;
  const backSource = isNext ? incomingLeft : incomingRight;
  const hiddenPage = isNext ? rightImage : leftImage;
  hiddenPage.style.visibility = "hidden";

  const turningSheet = createTurningSheet(direction, frontSource, backSource);
  bookStage.append(turningSheet);

  requestAnimationFrame(() => turningSheet.classList.add("is-turning"));

  window.setTimeout(() => {
    currentSpread = spread;
    setSpreadImages(spread);
    hiddenPage.style.visibility = "";
    turningSheet.remove();
    updateBookUI();
    isTurning = false;
  }, 720);
}

function turnSingleTo(index, direction) {
  if (isTurning || index === currentSingleIndex || index < 0 || index >= singlePages.length) return;

  if (reducedMotion.matches) {
    currentSingleIndex = index;
    setSinglePageImages(index);
    updateBookUI();
    return;
  }

  isTurning = true;
  const incomingPage = singlePages[index];
  const incomingSource = pageSource(incomingPage.spread, incomingPage.side);
  underLeftImage.src = incomingSource;
  underLeftImage.hidden = false;
  underRightImage.hidden = true;
  leftImage.style.visibility = "hidden";

  const turningSheet = createTurningSheet(direction, leftImage.src, incomingSource);
  bookStage.append(turningSheet);
  requestAnimationFrame(() => turningSheet.classList.add("is-turning"));

  window.setTimeout(() => {
    currentSingleIndex = index;
    setSinglePageImages(index);
    leftImage.style.visibility = "";
    turningSheet.remove();
    updateBookUI();
    isTurning = false;
  }, 720);
}

function previousPage() {
  if (readingMode === "single") turnSingleTo(currentSingleIndex - 1, "prev");
  else turnTo(currentSpread - 1, "prev");
}

function nextPage() {
  if (readingMode === "single") turnSingleTo(currentSingleIndex + 1, "next");
  else turnTo(currentSpread + 1, "next");
}

previousButton.addEventListener("click", previousPage);
nextButton.addEventListener("click", nextPage);

pageRange.addEventListener("change", () => {
  const target = Number(pageRange.value);
  if (readingMode === "single") {
    const targetIndex = target - 1;
    turnSingleTo(targetIndex, targetIndex > currentSingleIndex ? "next" : "prev");
  } else {
    turnTo(target, target > currentSpread ? "next" : "prev");
  }
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    userSelectedReadingMode = true;
    applyReadingMode(button.dataset.bookMode);
  });
});

mobileReadingQuery.addEventListener("change", (event) => {
  if (!event.matches) {
    userSelectedReadingMode = false;
    applyReadingMode("spread");
  } else if (!userSelectedReadingMode) {
    applyReadingMode("single");
  }
});

bookStage.addEventListener("pointerdown", (event) => {
  pointerStartX = event.clientX;
});

bookStage.addEventListener("pointerup", (event) => {
  if (pointerStartX === null) return;
  const distance = event.clientX - pointerStartX;
  pointerStartX = null;
  if (Math.abs(distance) < 42) return;
  if (distance < 0) nextPage();
  else previousPage();
});

bookStage.addEventListener("pointercancel", () => {
  pointerStartX = null;
});

const bookVisibilityObserver = new IntersectionObserver(
  ([entry]) => {
    bookIsVisible = entry.isIntersecting;
  },
  { threshold: 0.32 },
);
bookVisibilityObserver.observe(bookTool);

document.addEventListener("keydown", (event) => {
  if (!bookIsVisible || lightbox.open) return;
  if (event.key === "ArrowLeft") previousPage();
  if (event.key === "ArrowRight") nextPage();
});

fullscreenButton.addEventListener("click", async () => {
  if (!document.fullscreenElement) {
    await bookTool.requestFullscreen();
  } else {
    await document.exitFullscreen();
  }
});

document.addEventListener("fullscreenchange", () => {
  fullscreenButton.textContent = document.fullscreenElement ? "退出全屏" : "全屏查看";
});

applyReadingMode(readingMode);
