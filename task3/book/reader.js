(() => {
  "use strict";

  const byId = id => document.getElementById(id);
  const { pages, entries } = window.BOOK;
  const lastSpread = pages.length / 2;
  const lastPage = pages.length - 1;
  const cover = byId("flat-right");
  const flatBook = byId("flat-book");
  const viewport = byId("viewport");
  const previewUrls = pages.map((url, i) => i === 0 ? cover.getAttribute("src") : url.replace(/\.jpg$/, ".webp"));
  const previous = byId("prev");
  const next = byId("next");
  const directory = byId("directory");
  const enlargement = byId("enlargement");
  const controls = byId("controls");
  const tools = byId("tools");
  const more = byId("more");
  let spread = 0;
  let motion;
  let pointer;
  let interacted = false;
  let toolTimeout;

  function spreadPages(s) {
    if (s === 0) return [0];
    if (s === lastSpread) return [lastPage];
    return [s * 2 - 1, s * 2];
  }

  function syncSpread(s) {
    spread = s;
    previous.disabled = s === 0;
    next.disabled = s === lastSpread;
    byId("status").textContent = s === 0 ? "封面" : s === lastSpread ? "封底" : `第 ${s * 2} 至 ${s * 2 + 1} 页，共 ${pages.length} 页`;
    document.querySelectorAll(".thumb").forEach((button, i) => {
      button.classList.toggle("active", Math.ceil(entries[i].page / 2) === s);
    });
  }

  function renderFlat(s) {
    const indexes = spreadPages(s);
    const left = byId("flat-left");
    left.hidden = indexes.length === 1;
    if (!left.hidden) setPage(left, indexes[0]);
    setPage(cover, indexes.at(-1));
    syncSpread(s);
  }

  function setPage(img, index) {
    const source = previewUrls[index];
    img.alt = index === 0 ? "重塑日常封面" : index === lastPage ? "重塑日常封底" : `第 ${index + 1} 页`;
    if (img.getAttribute("src") === source) return;
    img.onerror = () => {
      img.onerror = null;
      img.src = pages[index];
    };
    img.src = source;
  }

  function disableMotion(s) {
    motion?.disable();
    motion = null;
    viewport.hidden = true;
    flatBook.hidden = false;
    renderFlat(s);
  }

  function go(s) {
    interacted = true;
    if (s < 0 || s > lastSpread) return;
    if (motion) motion.go(s);
    else renderFlat(s);
  }

  function turn(direction) {
    interacted = true;
    if (motion) motion.flip(direction);
    else go(spread + direction);
  }

  function revealTools() {
    controls.classList.add("visible");
    clearTimeout(toolTimeout);
    toolTimeout = setTimeout(() => {
      if (tools.hidden) controls.classList.remove("visible");
    }, 1800);
  }

  function closeTools() {
    tools.hidden = true;
    more.setAttribute("aria-expanded", "false");
    controls.classList.remove("visible");
  }

  function buildDirectory() {
    const list = byId("thumbs");
    if (list.childElementCount) return;
    entries.forEach(entry => {
      const button = document.createElement("button");
      button.className = "thumb";
      button.setAttribute("aria-label", "跳转到" + entry.label);
      const preview = document.createElement("div");
      preview.className = "preview";
      const img = new Image();
      img.src = entry.page === 0 ? previewUrls[0] : entry.thumb;
      img.alt = "";
      img.loading = "lazy";
      const label = document.createElement("span");
      label.textContent = entry.label;
      preview.append(img);
      button.append(preview, label);
      button.onclick = () => {
        go(Math.ceil(entry.page / 2));
        directory.close();
      };
      list.append(button);
    });
  }

  previous.onclick = () => turn(-1);
  next.onclick = () => turn(1);
  flatBook.addEventListener("pointerdown", event => {
    if (!event.isPrimary || event.button !== 0) return;
    interacted = true;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, image: event.target };
    flatBook.setPointerCapture(event.pointerId);
  });
  flatBook.addEventListener("pointerup", event => {
    if (!pointer || event.pointerId !== pointer.id) return;
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    if (Math.abs(dx) > 28 && Math.abs(dx) > Math.abs(dy)) turn(dx < 0 ? 1 : -1);
    else if (Math.hypot(dx, dy) < 8 && pointer.image instanceof HTMLImageElement) {
      turn(pointer.image.id === "flat-left" || spread === lastSpread ? -1 : 1);
    }
    pointer = null;
  });
  flatBook.addEventListener("pointercancel", () => { pointer = null; });
  document.addEventListener("keydown", event => {
    if (document.querySelector("dialog[open]")) return;
    const actions = { ArrowLeft: () => turn(-1), ArrowRight: () => turn(1), Home: () => go(0), End: () => go(lastSpread) };
    const action = actions[event.key];
    if (!Object.hasOwn(actions, event.key)) return;
    event.preventDefault();
    action();
  });
  document.addEventListener("pointermove", event => {
    if (event.clientY > innerHeight - 90) revealTools();
  });
  document.addEventListener("pointerdown", event => {
    if (event.pointerType === "touch") revealTools();
  });

  more.onclick = () => {
    interacted = true;
    tools.hidden = !tools.hidden;
    more.setAttribute("aria-expanded", String(!tools.hidden));
    revealTools();
  };
  byId("home").onclick = () => { go(0); closeTools(); };
  byId("contents").onclick = () => {
    buildDirectory();
    syncSpread(spread);
    directory.showModal();
    closeTools();
  };
  byId("zoom").onclick = () => {
    const gallery = byId("large-pages");
    gallery.className = "";
    gallery.replaceChildren();
    for (const index of spreadPages(spread)) {
      const img = new Image();
      img.src = pages[index];
      img.alt = `第 ${index + 1} 页`;
      img.onclick = () => gallery.classList.toggle("detail");
      gallery.append(img);
    }
    enlargement.showModal();
    closeTools();
  };
  document.querySelectorAll("[data-close]").forEach(button => {
    button.onclick = () => button.closest("dialog").close();
  });
  for (const dialog of [directory, enlargement]) {
    dialog.addEventListener("click", event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) {
        dialog.close();
      }
    });
  }
  const fullscreen = byId("fullscreen");
  fullscreen.hidden = !document.fullscreenEnabled;
  fullscreen.onclick = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      fullscreen.hidden = true;
    }
    closeTools();
  };

  function loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.fetchPriority = "low";
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    });
  }

  async function enableMotion() {
    const start = performance.now();
    const connection = navigator.connection;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || connection?.saveData || connection?.effectiveType?.endsWith("2g")) return;
    try {
      await cover.decode();
      if (interacted) return;
      await Promise.all([loadScript("book/three.min.js"), loadScript("book/motion.js?v=1")]);
      if (interacted || performance.now() - start > 8000) return;
      motion = window.createBookMotion({
        urls: previewUrls,
        cover,
        onSpreadChange: syncSpread,
        onUnavailable: disableMotion
      });
      viewport.append(motion.canvas);
      viewport.hidden = false;
      flatBook.hidden = true;
    } catch (error) {
      console.warn("Book motion unavailable:", error);
      disableMotion(spread);
    }
  }

  enableMotion();
})();
