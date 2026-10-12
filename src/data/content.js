const projects = [
  { id: "breeze", number: "01", title: "Breeze", shape: "circle", color: "blue", status: "Fashion design", embed: "breeze/index.html", category: "fashion", media: [] },
  { id: "dance-event", number: "02", title: "Candy Random Dance", shape: "oval", color: "pink", status: "Offline event", embed: "random-dance/index.html", category: "events", media: [] },
  { id: "birthday-offline-event", number: "03", title: "ASAHI Birthday Offline", shape: "pill", color: "yellow", status: "Offline event", embed: "asahi-birthday-offline/index.html", category: "events", media: [] },
  { id: "mama", number: "04", title: "MAMA Color Lab", shape: "frame", color: "white", status: "Competition project", embed: "mama-color-lab/index.html", category: "visual", thumbnail: "mama-color-lab/assets/images/hero.webp.w768.webp", media: [] },
  { id: "blossom-midnight", number: "05", title: "Blossom in Midnight", color: "pink", status: "Fashion design", embed: "blossom-midnight/index.html", category: "fashion", media: [] },
  { id: "menswear-planning", number: "06", title: "Menswear Planning", color: "blue", status: "Fashion planning", embed: "menswear-planning/index.html", category: "fashion", thumbnail: "menswear-planning/assets/slides/slide-3.png.w768.webp", media: [] },
  { id: "task3", number: "07", title: "TASK3", color: "yellow", status: "Fashion design", embed: "task3/index.html", category: "fashion", thumbnail: "task3/assets/brand/hero-final.jpg.w768.webp", media: [] }
];
projects[0].thumbnail = "breeze/assets/hero.webp.w768.webp";
projects[1].thumbnail = "random-dance/assets/hero-poster.jpg.w768.webp";
projects[2].thumbnail = "asahi-birthday-offline/public/birthday-assets/hero-asahi.jpg.w768.webp";
projects[4].thumbnail = "blossom-midnight/assets/model-day-with-logo.png.w768.webp";
const archiveCategories = [
  { id: "fashion", label: "Fashion", color: "blue" },
  { id: "events", label: "Offline Events", color: "pink" },
  { id: "visual", label: "Visual Design", color: "yellow" }
];
const archiveEntries = projects;
projects.forEach(function (project) { project.embed += "?v=2.0.1"; });
window.CANDY_CONTENT = { projects, featuredIds: ["breeze", "dance-event", "birthday-offline-event", "mama"], archiveCategories, archiveEntries };
