const photos = [
  {id:10,  cat:"nature",  title:"Forest light"},
  {id:237, cat:"animals", title:"Black puppy"},
  {id:16,  cat:"travel",  title:"Coastline"},
  {id:15,  cat:"nature",  title:"Waterfall"},
  {id:1025,cat:"animals", title:"Pug in a blanket"},
  {id:17,  cat:"travel",  title:"Open road"},
  {id:1018,cat:"nature",  title:"Mountain valley"},
  {id:1020,cat:"animals", title:"Brown bear"},
  {id:1016,cat:"travel",  title:"Canyon walls"},
  {id:1015,cat:"nature",  title:"River bend"},
  {id:1024,cat:"animals", title:"Bird watching"},
  {id:1011,cat:"travel",  title:"Canoe at dawn"}
];
const src = (id, w, h) => `https://picsum.photos/id/${id}/${w}/${h}`;
const hues = {nature:"#0f766e", animals:"#b45309", travel:"#1d4ed8"};
// shown instead of the photo if the internet/photo host is unavailable
function fallback(title, cat) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="${hues[cat]}"/><text x="400" y="310" font-family="Arial" font-size="44" fill="#fff" text-anchor="middle">${title}</text></svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

const grid = document.getElementById("grid");
const lb = document.getElementById("lightbox");
const lbImg = document.getElementById("lb-img");
const lbCap = document.getElementById("lb-cap");
let visible = [];   // photos matching the current filter
let current = 0;

// build cards
photos.forEach((p, i) => {
  const b = document.createElement("button");
  b.className = "card";
  b.dataset.cat = p.cat;
  b.dataset.index = i;
  b.setAttribute("aria-label", `Open ${p.title}`);
  b.innerHTML = `<img loading="lazy" src="${src(p.id, 600, 450)}" alt="${p.title}"><span class="label">${p.title}</span>`;
  b.querySelector("img").onerror = e => { e.target.onerror = null; e.target.src = fallback(p.title, p.cat); };
  b.addEventListener("click", () => openBox(p));
  grid.appendChild(b);
});

// filters
function applyFilter(f) {
  document.querySelectorAll(".card").forEach(c => c.classList.toggle("hide", f !== "all" && c.dataset.cat !== f));
  visible = photos.filter(p => f === "all" || p.cat === f);
  document.querySelectorAll(".chip").forEach(c => c.classList.toggle("active", c.dataset.filter === f));
}
document.querySelectorAll(".chip").forEach(c => c.addEventListener("click", () => applyFilter(c.dataset.filter)));
applyFilter("all");

// lightbox
function show() {
  const p = visible[current];
  lbImg.onerror = () => { lbImg.onerror = null; lbImg.src = fallback(p.title, p.cat); };
  lbImg.src = src(p.id, 1200, 800);
  lbImg.alt = p.title;
  lbCap.textContent = `${p.title}  (${current + 1} / ${visible.length})`;
}
function openBox(p) { current = visible.indexOf(p); lb.hidden = false; document.body.style.overflow = "hidden"; show(); }
function closeBox() { lb.hidden = true; document.body.style.overflow = ""; }
function step(d) { current = (current + d + visible.length) % visible.length; show(); }

document.getElementById("next").onclick = () => step(1);
document.getElementById("prev").onclick = () => step(-1);
document.getElementById("close").onclick = closeBox;
lb.addEventListener("click", e => { if (e.target === lb) closeBox(); });
document.addEventListener("keydown", e => {
  if (lb.hidden) return;
  if (e.key === "ArrowRight") step(1);
  if (e.key === "ArrowLeft") step(-1);
  if (e.key === "Escape") closeBox();
});
// swipe support on touch screens
let x0 = null;
lb.addEventListener("touchstart", e => x0 = e.touches[0].clientX, {passive:true});
lb.addEventListener("touchend", e => {
  if (x0 === null) return;
  const dx = e.changedTouches[0].clientX - x0;
  if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
  x0 = null;
});
