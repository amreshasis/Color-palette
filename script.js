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

function displayPalette() {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];
  const seed = hashDate(dateStr);
  const palette = generateColors(seed);

  const container = document.getElementById("palette");
  const dateInfo = document.getElementById("date-info");
  container.innerHTML = "";

  palette.forEach(color => {
    const div = document.createElement("div");
    div.className = "color-box";
    div.style.backgroundColor = color;
    div.title = "Click to copy";

    const label = document.createElement("div");
    label.className = "color-label";
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
}

displayPalette();
