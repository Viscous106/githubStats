// @ts-check
// Layout modelled after DenverCoder1/github-readme-streak-stats

import { getCardColors } from "../common/color.js";
import { encodeHTML } from "../common/html.js";

const W = 495;
const H = 200;
// Ring geometry (demolab-derived, shifted +22 down to leave room for title)
const RING_CX = W / 2;       // 247.5
const RING_CY = 93;           // ring centre
const RING_R = 40;
const RING_C = 2 * Math.PI * RING_R; // ~251.3

// Demolab fire SVG path (centred at 0,0; height ~22 units, width ~16)
const FIRE_PATH = "M 1.5 0.67 C 1.5 0.67 2.24 3.32 2.24 5.47 C 2.24 7.53 0.89 9.2 -1.17 9.2 C -3.23 9.2 -4.79 7.53 -4.79 5.47 L -4.76 5.11 C -6.78 7.51 -8 10.62 -8 13.99 C -8 18.41 -4.42 22 0 22 C 4.42 22 8 18.41 8 13.99 C 8 8.6 5.41 3.79 1.5 0.67 Z M -0.29 19 C -2.07 19 -3.51 17.6 -3.51 15.86 C -3.51 14.24 -2.46 13.1 -0.7 12.74 C 1.07 12.38 2.9 11.53 3.92 10.16 C 4.31 11.45 4.51 12.81 4.51 14.2 C 4.51 16.85 2.36 19 -0.29 19 Z";

const fmtDate = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day))
    .toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
};

const renderStreakCard = (streakData, options = {}) => {
  const {
    theme = "default",
    title_color,
    text_color,
    bg_color,
    border_color,
    icon_color,
    ring_color,
    hide_border = false,
    border_radius = 4.5,
    custom_title,
    disable_animations = false,
  } = options;

  const { titleColor, textColor, bgColor, borderColor, ringColor } = getCardColors({
    title_color,
    text_color,
    icon_color: icon_color || "",
    bg_color,
    border_color,
    ring_color: ring_color || title_color || "",
    theme,
  });

  const {
    currentStreak, longestStreak, totalContributions,
    currentStreakStart, currentStreakEnd,
    longestStreakStart, longestStreakEnd,
  } = streakData;

  const title = encodeHTML(custom_title || "GitHub Streak Stats");

  const currentRange = currentStreak > 0
    ? `${fmtDate(currentStreakStart)} - ${fmtDate(currentStreakEnd)}`
    : "No active streak";
  const longestRange = longestStreak > 0
    ? `${fmtDate(longestStreakStart)} - ${fmtDate(longestStreakEnd)}`
    : "N/A";

  // Ring animation: start fully offset (invisible) → final position
  const finalDashOffset = 0;
  const animCss = disable_animations ? "" : `
    @keyframes streakRingAnim {
      from { stroke-dashoffset: ${RING_C.toFixed(2)}; }
      to   { stroke-dashoffset: ${finalDashOffset}; }
    }
    .s-ring { animation: streakRingAnim 1s ease-in-out forwards; }`;

  // Fire icon position: just above ring, overlapping the top
  const fireY = RING_CY - RING_R - 6; // translate y so fire sits above ring

  // Side panel helper
  const sidePanel = (cx, count, label, sub) => `
    <text x="${cx}" y="73" font-size="26" font-weight="700" text-anchor="middle"
      dominant-baseline="middle" fill="${titleColor}">${count}</text>
    <text x="${cx}" y="107" font-size="12" font-weight="700" text-anchor="middle"
      fill="${textColor}">${label}</text>
    <text x="${cx}" y="125" font-size="11" text-anchor="middle"
      fill="${textColor}" opacity="0.7">${sub}</text>`;

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"
  xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="streak-title">
  <title id="streak-title">${title}</title>
  <defs>
    <!-- mask hides ring behind the fire icon -->
    <mask id="fire-mask">
      <rect width="${W}" height="${H}" fill="white"/>
      <ellipse cx="${RING_CX}" cy="${RING_CY - RING_R + 12}" rx="13" ry="18" fill="black"/>
    </mask>
  </defs>
  <style>
    text { font-family: 'Segoe UI', Ubuntu, sans-serif; }
    .s-ring { stroke-dashoffset: ${disable_animations ? finalDashOffset : RING_C.toFixed(2)}; }
    ${animCss}
  </style>

  <!-- card background -->
  <rect x="0.5" y="0.5" rx="${border_radius}" ry="${border_radius}"
    width="${W - 1}" height="${H - 1}"
    fill="${bgColor}" stroke="${hide_border ? "none" : borderColor}"/>

  <!-- title -->
  <text x="${W / 2}" y="20" font-size="14" font-weight="600" text-anchor="middle"
    dominant-baseline="middle" fill="${titleColor}">${title}</text>

  <!-- dividers -->
  <line x1="165" y1="30" x2="165" y2="170" stroke="${borderColor}" stroke-opacity="0.3"/>
  <line x1="330" y1="30" x2="330" y2="170" stroke="${borderColor}" stroke-opacity="0.3"/>

  <!-- LEFT: Total Contributions -->
  ${sidePanel(82, totalContributions.toLocaleString(), "Total Contributions", "Last 12 months")}

  <!-- CENTER: Current Streak -->

  <!-- ring rim (faint) -->
  <circle cx="${RING_CX}" cy="${RING_CY}" r="${RING_R}"
    fill="none" stroke="${ringColor}" stroke-width="5" stroke-opacity="0.15"
    mask="url(#fire-mask)"/>
  <!-- ring fill -->
  <circle class="s-ring" cx="${RING_CX}" cy="${RING_CY}" r="${RING_R}"
    fill="none" stroke="${ringColor}" stroke-width="5"
    stroke-dasharray="${RING_C.toFixed(2)}"
    stroke-linecap="round"
    mask="url(#fire-mask)"/>

  <!-- fire icon (SVG path, centred at ring top) -->
  <path d="${FIRE_PATH}" fill="${ringColor}"
    transform="translate(${RING_CX}, ${fireY}) scale(1.1)"/>

  <!-- current streak number (inside ring) -->
  <text x="${RING_CX}" y="76" font-size="26" font-weight="700" text-anchor="middle"
    dominant-baseline="middle" fill="${ringColor}">${currentStreak}</text>

  <!-- label -->
  <text x="${RING_CX}" y="144" font-size="12" font-weight="700" text-anchor="middle"
    fill="${textColor}">Current Streak</text>
  <!-- date -->
  <text x="${RING_CX}" y="161" font-size="11" text-anchor="middle"
    fill="${textColor}" opacity="0.7">${currentRange}</text>

  <!-- RIGHT: Longest Streak -->
  ${sidePanel(412, longestStreak, "Longest Streak", longestRange)}
</svg>`;
};

export { renderStreakCard };
export default renderStreakCard;
