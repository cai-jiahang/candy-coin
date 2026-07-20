const projects = [
  {
    id: "breeze",
    number: "01",
    title: "Breeze",
    shape: "circle",
    color: "blue",
    status: "Content to be added",
    year: "—",
    note: "Project text, process notes and visual material will live here.",
    media: [],
  },
  {
    id: "dance-event",
    number: "02",
    title: "Dance Event",
    shape: "oval",
    color: "pink",
    status: "Content to be added",
    year: "—",
    note: "Project text, process notes and visual material will live here.",
    media: [],
  },
  {
    id: "birthday-offline-event",
    number: "03",
    title: "Birthday Offline Event",
    shape: "pill",
    color: "yellow",
    status: "Content to be added",
    year: "—",
    note: "Project text, process notes and visual material will live here.",
    media: [],
  },
  {
    id: "future-collection",
    number: "04",
    title: "Future Collection",
    shape: "frame",
    color: "white",
    status: "Future concept",
    year: "—",
    note: "Future material can be collected here without inventing a finished outcome.",
    media: [],
  },
];

const archiveCategories = [
  { id: "experiments", label: "Experiments", color: "blue" },
  { id: "unfinished", label: "Unfinished Ideas", color: "pink" },
  { id: "ai", label: "AI Experiments", color: "yellow" },
  { id: "research", label: "Visual Research", color: "white" },
  { id: "future", label: "Future Concepts", color: "blue" },
];

// Add real archive entries here later. Empty media is rendered as an intentional placeholder.
const archiveEntries = [];

window.CANDY_CONTENT = { projects, archiveCategories, archiveEntries };
