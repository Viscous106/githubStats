// @ts-check

import { getCardColors } from "../common/color.js";
import { encodeHTML } from "../common/html.js";

const CARD_WIDTH = 495;
const CARD_HEIGHT = 195;

/**
 * Format a date string (YYYY-MM-DD) to "Jun 1" style.
 *
 * @param {string} dateStr ISO date string.
 * @returns {string}
 */
const fmtDate = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
};

/**
 * Renders the streak card as an SVG string.
 *
 * @param {object} streakData Streak data from fetchStreak.
 * @param {object} options Card options.
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
    hide_border = false,
    border_radius = 4.5,
    custom_title,
    disable_animations = false,
  } = options;

  // getCardColors returns values WITH the '#' prefix
  const { titleColor, textColor, bgColor, borderColor } = getCardColors({
    title_color,
    text_color,
    icon_color: icon_color || "",
    bg_color,
    border_color,
    ring_color: title_color || "",
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

  const animCss = disable_animations
    ? ""
    : `
    @keyframes scaleIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .number { animation: scaleIn 0.3s ease-in-out forwards; }
  `;

  const divider = `<line x1="165" y1="28" x2="165" y2="170" stroke="${borderColor}" stroke-opacity="0.5" stroke-width="1"/>
  <line x1="330" y1="28" x2="330" y2="170" stroke="${borderColor}" stroke-opacity="0.5" stroke-width="1"/>`;

  const fireIcon = `<text x="0" y="0" font-size="32" text-anchor="middle" dominant-baseline="middle">🔥</text>`;
  const calIcon  = `<text x="0" y="0" font-size="28" text-anchor="middle" dominant-baseline="middle">📅</text>`;
  const trophyIcon = `<text x="0" y="0" font-size="28" text-anchor="middle" dominant-baseline="middle">🏆</text>`;

  const panel = (x, icon, count, label, subLabel) => `
    <g transform="translate(${x}, 98)">
      <g transform="translate(0, -55)">${icon}</g>
      <text class="number" x="0" y="-10" font-size="28" font-weight="bold" text-anchor="middle" fill="${titleColor}">${count}</text>
      <text x="0" y="14" font-size="11" text-anchor="middle" fill="${textColor}" font-weight="600">${label}</text>
      <text x="0" y="32" font-size="10" text-anchor="middle" fill="${textColor}" opacity="0.7">${subLabel}</text>
    </g>
  `;

  const currentRange = currentStreak > 0
    ? `${fmtDate(currentStreakStart)} – ${fmtDate(currentStreakEnd)}`
    : "No active streak";
  const longestRange = longestStreak > 0
    ? `${fmtDate(longestStreakStart)} – ${fmtDate(longestStreakEnd)}`
    : "N/A";
  const totalYear = "Last 12 months";

  return `
<svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}"
  xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="streak-title">
  <title id="streak-title">${title}</title>
  <style>
    .title { font: 600 15px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${titleColor}; }
    .number { font: 700 28px 'Segoe UI', Ubuntu, Sans-Serif; }
    text { font-family: 'Segoe UI', Ubuntu, Sans-Serif; }
    ${animCss}
  </style>

  <!-- Background -->
  <rect x="0.5" y="0.5" rx="${border_radius}" ry="${border_radius}"
    width="${CARD_WIDTH - 1}" height="${CARD_HEIGHT - 1}"
    fill="${bgColor}" stroke="${hide_border ? "none" : borderColor}" />

  <!-- Title -->
  <text x="${CARD_WIDTH / 2}" y="24" text-anchor="middle" class="title">${title}</text>

  <!-- Dividers -->
  ${divider}

  <!-- Panels -->
  ${panel(82, fireIcon, currentStreak, "Current Streak", currentRange)}
  ${panel(247, calIcon, totalContributions.toLocaleString(), "Total Contributions", totalYear)}
  ${panel(412, trophyIcon, longestStreak, "Longest Streak", longestRange)}
</svg>`.trim();
};

export { renderStreakCard };
export default renderStreakCard;
