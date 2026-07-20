(function () {
  "use strict";

  var content = window.CANDY_CONTENT;
  var app = document.getElementById("app");
  var activeArchiveCategory = "all";
  var eras = [
    { name: "White Era", color: "#ffffff", border: "#777777" },
    { name: "Candy Pink Era", color: "#f5b4b0", border: "#ef5547" },
    { name: "Coin Yellow Era", color: "#f2ed12", border: "#d8bd00" },
    { name: "Light Blue Era", color: "#c6f3f1", border: "#47cfc9" }
  ];
  var entranceEra = eras[Math.floor(Math.random() * eras.length)];

  function logoHtml(className, compact) {
    return '<img class="brand-logo ' + (compact ? "brand-logo--compact " : "") + (className || "") +
      '" src="src/assets/brand/candy-coins-logo.png" alt="CANDY COINS">';
  }

  function coinRingHtml(variant, className, style) {
    return '<span class="coin-ring reference-coin--' + variant + ' ' + (className || "") +
      '" style="' + (style || "") + '" aria-hidden="true">' +
      '<img src="src/assets/reference/home-reference.png" alt=""></span>';
  }

  function renderEntrance() {
    app.innerHTML =
      '<main class="entrance" style="--era-color:' + entranceEra.color + ';--era-border:' + entranceEra.border + '">' +
        '<p class="sr-only">Current color world: ' + entranceEra.name + '</p>' +
        '<div class="entrance-frame">' +
          coinRingHtml("plain", "entrance-coin entrance-coin--top", "--drop-delay:.15s") +
          coinRingHtml("capsule", "entrance-coin entrance-coin--left", "--drop-delay:.35s") +
          coinRingHtml("capsule", "entrance-coin entrance-coin--right", "--drop-delay:.52s") +
          coinRingHtml("plain", "entrance-coin entrance-coin--bottom", "--drop-delay:.72s") +
          '<div class="entrance-identity">' +
            logoHtml("", false) +
            '<p>Creative label by Cai Jiahang</p>' +
          '</div>' +
          '<button class="enter-button" type="button" disabled>[ENTER]</button>' +
        '</div>' +
        '<div class="transition-curtain" aria-hidden="true"></div>' +
      '</main>';

    var entrance = app.querySelector(".entrance");
    var enterButton = app.querySelector(".enter-button");
    window.setTimeout(function () {
      entrance.classList.add("is-ready");
      enterButton.disabled = false;
    }, 1600);

    enterButton.addEventListener("click", function () {
      if (entrance.classList.contains("is-leaving")) return;
      entrance.classList.add("is-leaving");
      enterButton.disabled = true;
      window.setTimeout(function () {
        window.location.hash = "#/projects";
      }, 1050);
    });
  }

  function navigationHtml(active) {
    var items = [
      { label: "Projects", path: "/projects" },
      { label: "About", path: "/about" },
      { label: "Archive", path: "/archive" },
      { label: "Contact", path: "/contact" }
    ];
    return items.map(function (item) {
      return '<a href="#' + item.path + '" class="' + (active === item.label.toLowerCase() ? "active" : "") + '">' +
        item.label + '</a>';
    }).join("");
  }

  function renderLayout(pageHtml, active) {
    app.innerHTML =
      '<div class="site-shell">' +
        '<header class="site-header">' +
          '<a class="header-logo-link" href="#/projects" aria-label="CANDY COINS projects">' +
            logoHtml("", true) +
          '</a>' +
          '<nav class="desktop-nav" aria-label="Primary navigation">' + navigationHtml(active) + '</nav>' +
          '<button class="menu-button" type="button" aria-expanded="false" aria-controls="mobile-navigation" aria-label="Open navigation">' +
            '<span class="menu-icon" aria-hidden="true"><i></i><i></i><i></i></span>' +
          '</button>' +
        '</header>' +
        '<div id="mobile-navigation" class="mobile-nav">' +
          navigationHtml(active) +
          '<span>Creative label by Cai Jiahang</span>' +
        '</div>' +
        coinRingHtml("plain", "ambient-ring ambient-ring--one") +
        coinRingHtml("capsule", "ambient-ring ambient-ring--two") +
        '<main class="site-main">' + pageHtml + '</main>' +
        '<footer class="site-footer">' +
          '<span>CANDY COINS</span>' +
          '<span>Creative label by Cai Jiahang</span>' +
          '<a href="#/contact">Contact</a>' +
        '</footer>' +
      '</div>';

    var menuButton = app.querySelector(".menu-button");
    var mobileNav = app.querySelector(".mobile-nav");
    menuButton.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("is-open");
      menuButton.classList.toggle("is-open", isOpen);
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    });
  }

  function renderProjects() {
    var objects = content.projects.map(function (project) {
      var projectTitle = project.id === "breeze"
        ? '<img class="breeze-mark" src="src/assets/projects/breeze/breeze-mark.png" alt="Breeze">'
        : '<strong>' + project.title + '</strong>';
      return '<a href="#/projects/' + project.id + '"' +
        ' class="project-object project-object--' + project.id + ' shape--' + project.shape + ' color--' + project.color + '"' +
        ' aria-label="Open project ' + project.number + ': ' + project.title + '">' +
          projectTitle +
          '<span class="object-status">' + project.status + '</span>' +
          '<span class="object-arrow" aria-hidden="true">↗</span>' +
        '</a>';
    }).join("");

    renderLayout(
      '<section class="projects-page page-enter">' +
        '<header class="projects-intro">' +
          '<p class="eyebrow">Personal universe · collected projects</p>' +
          logoHtml("projects-hero-logo", false) +
          '<p class="label-pill">Creative label by Cai Jiahang</p>' +
        '</header>' +
        '<div class="project-field" aria-label="Project collection">' + objects + '</div>' +
      '</section>',
      "projects"
    );
  }

  function renderProjectDetail(projectId) {
    var project = content.projects.find(function (item) { return item.id === projectId; });
    if (!project) {
      renderNotFound();
      return;
    }

    renderLayout(
      '<article class="detail-page page-enter detail-color--' + project.color + '">' +
        '<a class="text-link" href="#/projects"><span aria-hidden="true">←</span> Back to collection</a>' +
        '<header class="detail-header">' +
          '<div><p class="eyebrow">Collected project · ' + project.status + '</p><h1>' + project.title + '</h1></div>' +
          '<span class="detail-year">' + project.year + '</span>' +
        '</header>' +
        '<section class="detail-content">' +
          '<div class="media-placeholder">' +
            '<span>PROJECT VISUAL</span><strong>Content to be added</strong><small>Image / video / process material</small>' +
          '</div>' +
          '<div class="project-note">' +
            '<p class="eyebrow">Project note</p><p>' + project.note + '</p>' +
            '<div class="content-slot">Personal reflection to be added.</div>' +
          '</div>' +
        '</section>' +
      '</article>',
      "projects"
    );
  }

  function renderAbout() {
    var notes = [
      { title: "Fashion", prompt: "A note about your relationship with fashion and image-making." },
      { title: "Visual exploration", prompt: "What you are looking for now, even if it is still unfinished." }
    ];
    var noteHtml = notes.map(function (note) {
      return '<div class="about-note"><h2>' + note.title + '</h2>' +
        '<p>' + note.prompt + '</p><small>PERSONAL NOTE TO BE ADDED</small></div>';
    }).join("");

    renderLayout(
      '<article class="about-page page-enter">' +
        '<section class="about-lead">' +
          '<div class="about-coins" aria-hidden="true">' +
            coinRingHtml("plain", "about-ring about-ring--one") +
            coinRingHtml("capsule", "about-ring about-ring--two") +
            coinRingHtml("plain", "about-ring about-ring--three") +
          '</div>' +
          '<div class="about-statement">' +
            '<p class="eyebrow">Artist statement · work in progress</p>' +
            '<h1>Soft like candy.<br>Held like a coin.</h1>' +
            '<p class="statement-copy">CANDY COINS begins with two opposite ideas. Candy is soft, colorful and playful. Coins are hard, valuable and collectible. Together they form a personal creative label for holding images, experiments and visual memories.</p>' +
            '<p class="statement-copy">The three flattened coin shapes in the original logo and the white coin rings return as traces of movement: things found, carried and remembered.</p>' +
          '</div>' +
        '</section>' +
        '<section class="about-notes" aria-label="Personal statement sections to complete">' + noteHtml + '</section>' +
      '</article>',
      "about"
    );
  }

  function archiveFieldHtml() {
    var entries = activeArchiveCategory === "all"
      ? content.archiveEntries
      : content.archiveEntries.filter(function (entry) { return entry.category === activeArchiveCategory; });

    if (entries.length) {
      return '<div class="memory-field">' + entries.map(function (entry) {
        return '<article class="memory-object">' + entry.title + '</article>';
      }).join("") + '</div>';
    }

    var visibleCategories = content.archiveCategories.filter(function (category) {
      return activeArchiveCategory === "all" || category.id === activeArchiveCategory;
    });
    return '<div class="empty-memory-field">' + visibleCategories.map(function (category, index) {
      return '<div class="memory-slot color--' + category.color + ' memory-slot--' + (index + 1) + '">' +
        '<span>' + String(index + 1).padStart(2, "0") + '</span>' +
        '<strong>' + category.label + '</strong><small>OPEN MEMORY SLOT</small></div>';
    }).join("") + '</div>';
  }

  function renderArchive() {
    var filters = '<button data-category="all" class="' + (activeArchiveCategory === "all" ? "is-active" : "") + '">All memories</button>' +
      content.archiveCategories.map(function (category) {
        return '<button data-category="' + category.id + '" class="' +
          (activeArchiveCategory === category.id ? "is-active" : "") + '">' + category.label + '</button>';
      }).join("");

    renderLayout(
      '<section class="archive-page page-enter">' +
        '<header class="archive-intro">' +
          '<div><p class="eyebrow">Visual archive · memory space</p>' +
          '<h1>Not everything needs to become a finished project.</h1></div>' +
          '<p>Experiments, fragments, unfinished ideas and future concepts can remain here as visual memory.</p>' +
        '</header>' +
        '<div class="archive-filter" role="group" aria-label="Filter archive">' + filters + '</div>' +
        '<div class="archive-field-host">' + archiveFieldHtml() + '</div>' +
      '</section>',
      "archive"
    );

    app.querySelectorAll("[data-category]").forEach(function (button) {
      button.addEventListener("click", function () {
        activeArchiveCategory = button.getAttribute("data-category");
        renderArchive();
      });
    });
  }

  function renderContact() {
    var contactMethods = [
      { label: "Instagram", note: "Link to be added" },
      { label: "Are.na", note: "Link to be added" },
      { label: "Email", note: "Address to be added" }
    ];
    var rows = contactMethods.map(function (method) {
      return '<div class="contact-row"><span>' + method.label + '</span><small>' + method.note + '</small></div>';
    }).join("");

    renderLayout(
      '<section class="contact-page page-enter">' +
        '<div class="contact-intro">' +
          '<p class="eyebrow">Contact · creative connections</p>' +
          '<h1>Say hello.</h1>' +
          '<p>For projects, conversations and shared visual interests.</p>' +
        '</div>' +
        '<div class="contact-panel">' +
          rows +
          '<p class="contact-note">Real contact links can be added here when ready.</p>' +
        '</div>' +
      '</section>',
      "contact"
    );
  }

  function renderNotFound() {
    renderLayout(
      '<section class="not-found page-enter"><span>404</span>' +
        '<h1>This memory has not been collected.</h1>' +
        '<a class="label-pill" href="#/projects">Return to projects</a></section>',
      ""
    );
  }

  function route() {
    var path = window.location.hash.replace(/^#/, "") || "/";
    window.scrollTo(0, 0);

    if (path === "/") {
      renderEntrance();
    } else if (path === "/projects" || path === "/home") {
      renderProjects();
    } else if (path.indexOf("/projects/") === 0) {
      renderProjectDetail(path.split("/")[2]);
    } else if (path === "/about") {
      renderAbout();
    } else if (path === "/archive") {
      renderArchive();
    } else if (path === "/contact") {
      renderContact();
    } else {
      renderNotFound();
    }
  }

  window.addEventListener("hashchange", route);
  route();
}());
