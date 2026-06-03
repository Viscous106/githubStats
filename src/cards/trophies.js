// @ts-check

import { getCardColors } from "../common/color.js";
import { encodeHTML } from "../common/html.js";

const TROPHY_SIZE = 90;
const COLS = 6;
const PAD_X = 20;
const PAD_Y = 35;
const GAP = 8;

const TIERS = [
  { name: "SSS", color: "#f1c40f", minColor: "#f39c12", label: "SSS" },
  { name: "SS",  color: "#e74c3c", minColor: "#c0392b", label: "SS"  },
  { name: "S",   color: "#9b59b6", minColor: "#8e44ad", label: "S"   },
  { name: "AAA", color: "#2980b9", minColor: "#1a6fa3", label: "AAA" },
  { name: "AA",  color: "#27ae60", minColor: "#1e8449", label: "AA"  },
  { name: "A",   color: "#16a085", minColor: "#0e6655", label: "A"   },
  { name: "B",   color: "#7f8c8d", minColor: "#616a6b", label: "B"   },
  { name: "C",   color: "#95a5a6", minColor: "#717d7e", label: "C"   },
  { name: "?",   color: "#bdc3c7", minColor: "#909497", label: "?"   },
];

const CATEGORIES = [
  {
    title: "Total Commits",
    icon: "📝",
    getValue: (s) => s.totalCommits,
    thresholds: [3000, 2000, 1000, 500, 200, 100, 50, 10],
  },
  {
    title: "Total Stars",
    icon: "⭐",
    getValue: (s) => s.totalStars,
    thresholds: [500, 200, 100, 50, 30, 10, 5, 1],
  },
  {
    title: "Total PRs",
    icon: "🔀",
    getValue: (s) => s.totalPRs,
    thresholds: [500, 300, 200, 100, 50, 20, 10, 1],
  },
  {
    title: "Total Issues",
    icon: "🐛",
    getValue: (s) => s.totalIssues,
    thresholds: [200, 100, 50, 30, 20, 10, 5, 1],
  },
  {
    title: "Contributed To",
    icon: "🤝",
    getValue: (s) => s.contributedTo,
    thresholds: [100, 70, 50, 30, 20, 10, 5, 1],
  },
  {
    title: "Rank",
    icon: "🏅",
    getValue: (s) => {
      const map = { "S+": 8, S: 7, "A++": 6, "A+": 5, A: 4, B: 3, C: 2 };
      return map[s.rank?.level] ?? 0;
    },
    thresholds: [8, 7, 6, 5, 4, 3, 2, 1],
    formatValue: (s) => s.rank?.level || "?",
  },
];

/**
 * Get tier index (0=SSS, 8=unknown) based on value and thresholds.
 *
 * @param {number} value Stat value.
 * @param {number[]} thresholds Descending threshold list.
 * @returns {number} Tier index.
 */
const getTierIndex = (value, thresholds) => {
  for (let i = 0; i < thresholds.length; i++) {
    if (value >= thresholds[i]) return i;
  }
  return 8; // unknown/unranked
};

/**
 * Render a single trophy SVG group.
 *
 * @param {object} params
 * @param {number} params.x X offset.
 * @param {number} params.y Y offset.
 * @param {string} params.icon Emoji icon.
 * @param {string} params.title Trophy title.
 * @param {string|number} params.value Display value.
 * @param {number} params.tierIdx Tier index.
 * @param {string} params.textColor Text color hex (no #).
 * @returns {string} SVG group markup.
 */
const renderTrophy = ({ x, y, icon, title, value, tierIdx, textColor }) => {
  const tier = TIERS[tierIdx];
  const cx = TROPHY_SIZE / 2;
  const cy = TROPHY_SIZE / 2 - 6;

  return `
<g transform="translate(${x}, ${y})">
  <!-- Trophy cup path -->
  <rect x="2" y="2" width="${TROPHY_SIZE - 4}" height="${TROPHY_SIZE - 4}" rx="6"
    fill="${tier.color}18" stroke="${tier.color}" stroke-width="1.5" />
  <text x="${cx}" y="${cy - 10}" font-size="22" text-anchor="middle" dominant-baseline="middle">${icon}</text>
  <text x="${cx}" y="${cy + 14}" font-size="13" font-weight="bold" text-anchor="middle"
    dominant-baseline="middle" fill="${tier.color}">${tier.label}</text>
  <text x="${cx}" y="${cy + 28}" font-size="9" text-anchor="middle"
    dominant-baseline="middle" fill="${textColor}" opacity="0.85">${encodeHTML(title)}</text>
  <text x="${cx}" y="${TROPHY_SIZE - 10}" font-size="11" font-weight="600" text-anchor="middle"
    dominant-baseline="middle" fill="${tier.color}">${value}</text>
</g>`;
};

/**
 * Render the trophies card as an SVG string.
 *
 * @param {object} statsData Stats data from fetchStats.
 * @param {object} options Card options.
 * @returns {string} SVG markup.
 */
const renderTrophiesCard = (statsData, options = {}) => {
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
    columns,
  } = options;

  const { titleColor, textColor, bgColor, borderColor } = getCardColors({
    title_color,
    text_color,
    icon_color: icon_color || "",
    bg_color,
    border_color,
    ring_color: title_color || "",
    theme,
  });

  const cols = Math.min(Math.max(parseInt(columns, 10) || COLS, 1), 6);
  const rows = Math.ceil(CATEGORIES.length / cols);

  const cardWidth = PAD_X * 2 + cols * TROPHY_SIZE + (cols - 1) * GAP;
  const cardHeight = PAD_Y + 10 + rows * TROPHY_SIZE + (rows - 1) * GAP + 15;

  const title = encodeHTML(custom_title || `${statsData.name}'s GitHub Trophies`);

  const trophies = CATEGORIES.map((cat, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = PAD_X + col * (TROPHY_SIZE + GAP);
    const y = PAD_Y + row * (TROPHY_SIZE + GAP);
    const value = cat.getValue(statsData);
    const displayValue = cat.formatValue ? cat.formatValue(statsData) : value.toLocaleString();
    const tierIdx = getTierIndex(value, cat.thresholds);
    return renderTrophy({ x, y, icon: cat.icon, title: cat.title, value: displayValue, tierIdx, textColor });
  }).join("");

  return `
<svg width="${cardWidth}" height="${cardHeight}" viewBox="0 0 ${cardWidth} ${cardHeight}"
  xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="trophy-title">
  <title id="trophy-title">${title}</title>
  <style>
    text { font-family: 'Segoe UI', Ubuntu, Sans-Serif; }
    .title { font: 600 15px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${titleColor}; }
  </style>

  <!-- Background -->
  <rect x="0.5" y="0.5" rx="${border_radius}" ry="${border_radius}"
    width="${cardWidth - 1}" height="${cardHeight - 1}"
    fill="${bgColor}" stroke="${hide_border ? "none" : borderColor}" />

  <!-- Title -->
  <text x="${cardWidth / 2}" y="24" text-anchor="middle" class="title">${title}</text>

  <!-- Trophies -->
  ${trophies}
</svg>`.trim();
};

export { renderTrophiesCard };
export default renderTrophiesCard;
