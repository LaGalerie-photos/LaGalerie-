
const DATA_URL = "data/photos.json";

const $gallery = document.getElementById("gallery");
const $template = document.getElementById("cardTemplate");
const $filters = document.getElementById("filters");
const $search = document.getElementById("search");
const $lightbox = document.getElementById("lightbox");
const $lbImg = document.getElementById("lbImage");
const $lbCaption = document.getElementById("lbCaption");
const $year = document.getElementById("year");
const $themeToggle = document.getElementById("themeToggle");

let photos = [];
let filtered = [];
let categories = ["Tous"];
let activeCategory = "Tous";
let currentIndex = -1;

const normalize = (s) =>
  (s || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

function setBusy(isBusy) { $gallery.setAttribute("aria-busy", String(isBusy)); }

(async function init() {
  try {
    $year.textContent = new Date().getFullYear();
    const savedTheme = localStorage.getItem("theme") || "dark"; // sombre par défaut
    document.documentElement.classList.toggle("light", savedTheme === "light");

    const res = await fetch(DATA_URL);
    photos = await res.json();
    photos = photos.map((p, i) => ({ idx: i, ...p }));
    buildCategories();
    applyFilters();
    bindEvents();
  } catch (e) {
    console.error(e);
    $gallery.innerHTML = `<p>Impossible de charger les photos. Vérifie le fichier <code>${DATA_URL}</code>.</p>`;
  }
})();

function buildCategories() {
  const set = new Set(["Tous"]);
  photos.forEach(p => (p.categories || []).forEach(c => set.add(c)));
  categories = [...set];

  $filters.innerHTML = "";
  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = cat === activeCategory ? "active" : "";
    btn.textContent = cat;
    btn.addEventListener("click", () => {
      activeCategory = cat;
      document.querySelectorAll(".filters button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      applyFilters();
    });
    $filters.appendChild(btn);
  });
}

function applyFilters() {
  setBusy(true);
  const q = normalize($search.value);
  filtered = photos.filter(p => {
    const inCat = activeCategory === "Tous" || (p.categories || []).includes(activeCategory);
    const text = `${p.title} ${p.description || ""} ${(p.tags || []).join(" ")}`;
    const inSearch = normalize(text).includes(q);
    return inCat && inSearch;
  });
  renderGrid(filtered);
  setBusy(false);
}

function renderGrid(list) {
  $gallery.innerHTML = "";
  if (!list.length) {
    $gallery.innerHTML = `<p>Aucun résultat 🤷‍♂️</p>`;
    return;
  }
  const frag = document.createDocumentFragment();

  list.forEach((p, visibleIndex) => {
    const node = $template.content.cloneNode(true);
    const card = node.querySelector(".card");
    const img = node.querySelector(".thumb");
    const title = node.querySelector(".title");
    const tags = node.querySelector(".tags");

    img.src = p.src;
    img.alt = p.alt || p.title || "Photo";
    img.loading = "lazy";
    title.textContent = p.title || "Sans titre";
    tags.textContent = (p.tags || []).map(t => `#${t}`).join(" ");

    card.addEventListener("click", () => openLightboxByIndex(visibleIndex));
    card.addEventListener("keypress", (e) => {
      if (e.key === "Enter" || e.key === " ") openLightboxByIndex(visibleIndex);
    });

    frag.appendChild(node);
  });

  $gallery.appendChild(frag);
}

function openLightboxByIndex(visibleIndex) {
  currentIndex = visibleIndex;
  const p = filtered[currentIndex];
  if (!p) return;

  const lbImg = document.getElementById('lbImage');
  const lbCaption = document.getElementById('lbCaption');
  lbImg.src = p.src;
  lbImg.alt = p.alt || p.title || "";
  lbCaption.textContent = p.description || p.title || "";
  $lightbox.classList.add("open");
  $lightbox.setAttribute("aria-hidden", "false");
}

function closeLightbox() {
  $lightbox.classList.remove("open");
  $lightbox.setAttribute("aria-hidden", "true");
}
function next() { if (!filtered.length) return; currentIndex = (currentIndex + 1) % filtered.length; openLightboxByIndex(currentIndex); }
function prev() { if (!filtered.length) return; currentIndex = (currentIndex - 1 + filtered.length) % filtered.length; openLightboxByIndex(currentIndex); }

function bindEvents() {
  $search.addEventListener("input", applyFilters);
  document.querySelector(".lb-close").addEventListener("click", closeLightbox);
  document.querySelector(".lb-next").addEventListener("click", next);
  document.querySelector(".lb-prev").addEventListener("click", prev);
  document.addEventListener("keydown", (e) => {
    if ($lightbox.classList.contains("open")) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    }
  });
  $lightbox.addEventListener("click", (e) => {
    if (e.target === $lightbox) closeLightbox();
  });
  $themeToggle.addEventListener("click", () => {
    const light = document.documentElement.classList.toggle("light");
    localStorage.setItem("theme", light ? "light" : "dark");
  });
}
