// @ts-check

import { getCardColors } from "../common/color.js";
import { encodeHTML } from "../common/html.js";

const CARD_WIDTH = 495;
const CARD_HEIGHT = 200;
const RING_R = 40;
const RING_C = 2 * Math.PI * RING_R; // circumference ≈ 251.3

/**
 * Format a YYYY-MM-DD date to "Jun 1" style (UTC).
 *
 * @param {string} dateStr
 * @returns {string}
 */
const fmtDate = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day))
    .toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
};

/**
 * Renders the streak card as an SVG string.
 *
 * @param {object} streakData
 * @param {object} options
 * @returns {string} SVG markup.
 */
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
    currentStreak,
    longestStreak,
    totalContributions,
    currentStreakStart,
    currentStreakEnd,
    longestStreakStart,
    longestStreakEnd,
  } = streakData;

  const title = encodeHTML(custom_title || "GitHub Streak Stats");

  const currentRange = currentStreak > 0
    ? `${fmtDate(currentStreakStart)} – ${fmtDate(currentStreakEnd)}`
    : "No active streak";
  const longestRange = longestStreak > 0
    ? `${fmtDate(longestStreakStart)} – ${fmtDate(longestStreakEnd)}`
    : "N/A";

  // Ring: 83% filled, gap symmetrically at the bottom
  const arcLen = RING_C * 0.83;
  const gapLen = RING_C - arcLen;
  // Offset so the arc is centred around the top (12 o'clock).
  // With rotate(-90), unshifted start is at 12 o'clock.
  // Shift back half-a-gap so the gap is centred at the bottom.
  const finalOffset = -(gapLen / 2);

  const animCss = disable_animations ? "" : `
    @keyframes ringIn {
      from { stroke-dashoffset: ${RING_C.toFixed(2)}; }
      to   { stroke-dashoffset: ${finalOffset.toFixed(2)}; }
    }
    .streak-ring { animation: ringIn 1s ease-in-out forwards; }`;

  const divY1 = 28, divY2 = 182;
  const cx = CARD_WIDTH / 2;           // 247.5
  const cy = CARD_HEIGHT / 2 + 8;      // 108

  // Side panel: big number + label + sub-label
  const sidePanel = (panelCx, count, label, sub) => `
    <g text-anchor="middle">
      <text x="${panelCx}" y="${cy - 12}" font-size="28" font-weight="700"
        dominant-baseline="middle" fill="${titleColor}">${count}</text>
      <text x="${panelCx}" y="${cy + 16}" font-size="11" font-weight="600"
        fill="${textColor}">${label}</text>
      <text x="${panelCx}" y="${cy + 32}" font-size="10"
        fill="${textColor}" opacity="0.6">${sub}</text>
    </g>`;

  // Center panel: ring + fire + big number + label + sub-label
  const centerPanel = `
    <g>
      <!-- ring rim (faint) -->
      <circle cx="${cx}" cy="${cy}" r="${RING_R}" fill="none"
        stroke="${ringColor}" stroke-width="5" stroke-opacity="0.15"
        stroke-dasharray="${RING_C.toFixed(2)}" stroke-linecap="round"/>
      <!-- ring fill, rotated so centre of arc is at top -->
      <circle class="streak-ring" cx="${cx}" cy="${cy}" r="${RING_R}" fill="none"
        stroke="${ringColor}" stroke-width="5"
        stroke-dasharray="${arcLen.toFixed(2)} ${gapLen.toFixed(2)}"
        stroke-dashoffset="${disable_animations ? finalOffset.toFixed(2) : RING_C.toFixed(2)}"
        stroke-linecap="round"
        transform="rotate(-90 ${cx} ${cy})"/>
      <!-- fire emoji above number -->
      <text x="${cx}" y="${cy - RING_R + 16}" font-size="15"
        text-anchor="middle" dominant-baseline="middle">🔥</text>
      <!-- current streak count -->
      <text x="${cx}" y="${cy + 6}" font-size="30" font-weight="700"
        text-anchor="middle" dominant-baseline="middle" fill="${ringColor}">${currentStreak}</text>
      <!-- label -->
      <text x="${cx}" y="${cy + RING_R + 22}" font-size="11" font-weight="600"
        text-anchor="middle" fill="${textColor}">Current Streak</text>
      <!-- date range -->
      <text x="${cx}" y="${cy + RING_R + 37}" font-size="10"
        text-anchor="middle" fill="${textColor}" opacity="0.6">${currentRange}</text>
    </g>`;

  return `<svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}"
  xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="streak-title">
  <title id="streak-title">${title}</title>
  <style>
    text { font-family: 'Segoe UI', Ubuntu, Sans-Serif; }
    ${animCss}
  </style>

  <!-- Background -->
  <rect x="0.5" y="0.5" rx="${border_radius}" ry="${border_radius}"
    width="${CARD_WIDTH - 1}" height="${CARD_HEIGHT - 1}"
    fill="${bgColor}" stroke="${hide_border ? "none" : borderColor}"/>

  <!-- Title -->
  <text x="${cx}" y="18" font-size="14" font-weight="600"
    text-anchor="middle" dominant-baseline="middle" fill="${titleColor}">${title}</text>

  <!-- Panel dividers -->
  <line x1="165" y1="${divY1}" x2="165" y2="${divY2}"
    stroke="${borderColor}" stroke-opacity="0.25" stroke-width="1"/>
  <line x1="330" y1="${divY1}" x2="330" y2="${divY2}"
    stroke="${borderColor}" stroke-opacity="0.25" stroke-width="1"/>

  <!-- Left: Total Contributions -->
  ${sidePanel(82, totalContributions.toLocaleString(), "Total Contributions", "Last 12 months")}

  <!-- Center: Current Streak -->
  ${centerPanel}

  <!-- Right: Longest Streak -->
  ${sidePanel(412, longestStreak, "Longest Streak", longestRange)}
</svg>`;
};

export { renderStreakCard };
export default renderStreakCard;
