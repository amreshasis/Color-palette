function hashDate(dateStr) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

function intToHex(i) {
  const color = (i & 0x00ffffff).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - color.length) + color;
}

function generateColors(seed, count = 5) {
  let colors = [];
  for (let i = 0; i < count; i++) {
    const val = (Math.sin(seed + i) * 10000) % 1;
    const hex = intToHex(Math.floor(val * 0xffffff));
    colors.push(hex);
  }
  return colors;
}

function getContrastYIQ(hex) {
  const r = parseInt(hex.substr(1, 2), 16);
  const g = parseInt(hex.substr(3, 2), 16);
  const b = parseInt(hex.substr(5, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#000' : '#fff';
}

function displayPalette(palette, dateStr) {
  const container = document.getElementById("palette");
  const dateInfo = document.getElementById("date-info");
  const nameEl = document.getElementById("palette-name");
  container.innerHTML = "";
  


  palette.forEach(color => {
  const div = document.createElement("div");
  div.className = "color-box";
  div.style.backgroundColor = color;
  div.style.boxShadow = `0 4px 15px ${color}88`; // semi-transparent hover glow

  const label = document.createElement("div");
  label.className = "color-label";
  label.style.color = getContrastYIQ(color);
  label.textContent = color;

  div.appendChild(label);
  div.addEventListener("click", () => {
    navigator.clipboard.writeText(color);
    label.textContent = "Copied!";
    setTimeout(() => label.textContent = color, 1000);
  });

  container.appendChild(div);
});


  dateInfo.textContent = `Palette for ${dateStr}`;
  nameEl.textContent = generatePaletteName(palette);
}

function generatePaletteName(palette) {
  const adjectives = ["Sunset", "Velvet", "Frosty", "Dreamy", "Bold", "Lush"];
  const nouns = ["Waves", "Fields", "Skies", "Mountains", "Echoes", "Shadows"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun}`;
}

function saveFavorite(palette) {
  const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  favorites.push(palette);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderFavorites();
}

function renderFavorites() {
  const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  const favContainer = document.getElementById("favorites");
  favContainer.innerHTML = "";
  favorites.forEach(palette => {
    const group = document.createElement("div");
    group.className = "favorite";
    palette.forEach(color => {
      const swatch = document.createElement("div");
      swatch.style.backgroundColor = color;
      group.appendChild(swatch);
    });
    favContainer.appendChild(group);
  });
}

function downloadAsJSON(palette) {
  const blob = new Blob([JSON.stringify(palette, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, "palette.json");
}

function downloadAsCSS(palette) {
  const css = palette.map((c, i) => `--color-${i + 1}: ${c};`).join("\n");
  const blob = new Blob([`:root {\n${css}\n}`], { type: "text/css" });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, "palette.css");
}

function downloadAsSVG(palette) {
  const rects = palette.map((c, i) => `<rect width="100" height="100" x="${i * 100}" fill="${c}" />`).join("\n");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${palette.length * 100}" height="100">${rects}</svg>`;
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, "palette.svg");
}

function downloadAsImage(palette) {
  const canvas = document.createElement("canvas");
  canvas.width = palette.length * 100;
  canvas.height = 100;
  const ctx = canvas.getContext("2d");
  palette.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(i * 100, 0, 100, 100);
  });
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    triggerDownload(url, "palette.png");
  });
}

function triggerDownload(url, filename) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function init() {
  const params = new URLSearchParams(window.location.search);
  const defaultDate = params.get("date") || new Date().toISOString().split("T")[0];
  const defaultCount = parseInt(params.get("count") || "5");
  document.getElementById("datePicker").value = defaultDate;
  document.getElementById("colorCount").value = defaultCount;
  const seed = hashDate(defaultDate);
  const palette = generateColors(seed, defaultCount);
  displayPalette(palette, defaultDate);
  renderFavorites();

  document.getElementById("datePicker").addEventListener("change", updatePalette);
  document.getElementById("colorCount").addEventListener("change", updatePalette);

  document.getElementById("saveBtn").addEventListener("click", () => saveFavorite(currentPalette));
  document.getElementById("shareBtn").addEventListener("click", () => {
    const date = document.getElementById("datePicker").value;
    const count = document.getElementById("colorCount").value;
    navigator.clipboard.writeText(`${location.origin}?date=${date}&count=${count}`);
    alert("Link copied!");
  });

  document.getElementById("downloadImgBtn").addEventListener("click", () => downloadAsImage(currentPalette));
  document.getElementById("downloadJsonBtn").addEventListener("click", () => downloadAsJSON(currentPalette));
  document.getElementById("downloadCssBtn").addEventListener("click", () => downloadAsCSS(currentPalette));
  document.getElementById("downloadSvgBtn").addEventListener("click", () => downloadAsSVG(currentPalette));
}

let currentPalette = [];

function updatePalette() {
  const date = document.getElementById("datePicker").value;
  const count = parseInt(document.getElementById("colorCount").value);
  const seed = hashDate(date);
  currentPalette = generateColors(seed, count);
  displayPalette(currentPalette, date);
}

window.onload = () => {
  init();
  updatePalette();
};
