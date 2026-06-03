// @ts-check

import { getCardColors } from "../common/color.js";
import { encodeHTML } from "../common/html.js";

const TW = 100;   // trophy card width
const TH = 140;   // trophy card height
const COLS_DEFAULT = 6;
const PAD_X = 16;
const PAD_TOP = 46;
const PAD_BOT = 14;
const GAP = 6;

// Catppuccin-accent tier palette (looks great on mocha and other dark themes too)
const TIERS = [
  { id: "SSS", label: "SSS", color: "#f9e2af" },  // yellow
  { id: "SS",  label: "SS",  color: "#f38ba8" },  // red
  { id: "S",   label: "S",   color: "#cba6f7" },  // mauve
  { id: "AAA", label: "AAA", color: "#89b4fa" },  // blue
  { id: "AA",  label: "AA",  color: "#94e2d5" },  // teal
  { id: "A",   label: "A",   color: "#a6e3a1" },  // green
  { id: "B",   label: "B",   color: "#89dceb" },  // sky
  { id: "C",   label: "C",   color: "#6c7086" },  // overlay
  { id: "?",   label: "?",   color: "#45475a" },  // surface
];

const CATEGORIES = [
  {
    title: "Total Commits",
    icon: "commit",
    getValue: (s) => s.totalCommits,
    thresholds: [3000, 2000, 1000, 500, 200, 100, 50, 10],
  },
  {
    title: "Total Stars",
    icon: "star",
    getValue: (s) => s.totalStars,
    thresholds: [500, 200, 100, 50, 30, 10, 5, 1],
  },
  {
    title: "Total PRs",
    icon: "pr",
    getValue: (s) => s.totalPRs,
    thresholds: [500, 300, 200, 100, 50, 20, 10, 1],
  },
  {
    title: "Total Issues",
    icon: "issue",
    getValue: (s) => s.totalIssues,
    thresholds: [200, 100, 50, 30, 20, 10, 5, 1],
  },
  {
    title: "Contributed To",
    icon: "contrib",
    getValue: (s) => s.contributedTo,
    thresholds: [100, 70, 50, 30, 20, 10, 5, 1],
  },
  {
    title: "Rank",
    icon: "rank",
    getValue: (s) => {
      const map = { "S+": 8, S: 7, "A++": 6, "A+": 5, A: 4, B: 3, C: 2 };
      return map[s.rank?.level] ?? 0;
    },
    thresholds: [8, 7, 6, 5, 4, 3, 2, 1],
    formatValue: (s) => s.rank?.level || "?",
  },
];

/**
 * SVG trophy cup, drawn in a 48×44 coordinate space.
 * The `size` param scales it proportionally.
 */
const trophyPath = (size, color) => {
  const k = size / 48;
  const p = (x, y) => `${(x * k).toFixed(1)},${(y * k).toFixed(1)}`;
  const n = (v) => (v * k).toFixed(1);
  return `<g>
    <path d="M${p(9,3)} L${p(39,3)} L${p(36,22)} Q${p(24,31)} ${p(12,22)} Z"
      fill="${color}"/>
    <path d="M${p(9,7)} Q${p(1,12)} ${p(5,20)} Q${p(9,25)} ${p(13,22)}"
      fill="none" stroke="${color}" stroke-width="${n(3.5)}" stroke-linecap="round"/>
    <path d="M${p(39,7)} Q${p(47,12)} ${p(43,20)} Q${p(39,25)} ${p(35,22)}"
      fill="none" stroke="${color}" stroke-width="${n(3.5)}" stroke-linecap="round"/>
    <rect x="${n(21)}" y="${n(31)}" width="${n(6)}" height="${n(8)}" rx="${n(1.5)}" fill="${color}"/>
    <rect x="${n(13)}" y="${n(38)}" width="${n(22)}" height="${n(5)}" rx="${n(2.5)}" fill="${color}"/>
  </g>`;
};

/** Inline SVG icon paths, 24-unit viewBox. */
const catIcon = (type, color) => {
  const d = {
    commit: `<circle cx="12" cy="12" r="4" fill="${color}"/>
      <path d="M2 12h6m8 0h6" stroke="${color}" stroke-width="2" stroke-linecap="round"/>`,
    star:   `<path d="M12 2l2.7 5.9 6.3.5-4.7 4.3 1.5 6.3L12 16l-5.8 3 1.5-6.3L3 8.4l6.3-.5z" fill="${color}"/>`,
    pr:     `<circle cx="6" cy="6" r="3" fill="${color}"/><circle cx="18" cy="18" r="3" fill="${color}"/>
      <path d="M6 9v12m12-3V6a3 3 0 00-3-3H9" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    issue:  `<circle cx="12" cy="12" r="9" stroke="${color}" stroke-width="2" fill="none"/>
      <path d="M12 8v4m0 4h.01" stroke="${color}" stroke-width="2" stroke-linecap="round"/>`,
    contrib:`<circle cx="9" cy="7" r="4" fill="${color}"/>
      <path d="M2 21v-1a7 7 0 0114 0v1" fill="${color}"/>
      <circle cx="18" cy="7" r="3" fill="${color}" opacity="0.6"/>
      <path d="M21 21v-1a5 5 0 00-4-4.9" stroke="${color}" stroke-width="1.5" fill="none"/>`,
    rank:   `<path d="M12 2l2.5 5.5 5.5.5-4 4 1.3 5.5L12 15l-5.3 2.5 1.3-5.5-4-4 5.5-.5z" fill="${color}"/>`,
  };
  return d[type] || d.rank;
};

const getTierIndex = (value, thresholds) => {
  for (let i = 0; i < thresholds.length; i++) {
    if (value >= thresholds[i]) return i;
  }
  return 8;
};

const tierProgress = (value, tierIdx, thresholds) => {
  if (tierIdx === 0) return 1;
  if (tierIdx >= thresholds.length) return Math.min(value / thresholds[thresholds.length - 1], 1);
  const lo = thresholds[tierIdx];
  const hi = thresholds[tierIdx - 1];
  return Math.max(0, Math.min(1, (value - lo) / (hi - lo)));
};

const renderTrophy = ({ x, y, cat, value, displayValue, tierIdx }) => {
  const tier = TIERS[tierIdx];
  const c = tier.color;
  const midX = TW / 2;
  const prog = tierProgress(value, tierIdx, cat.thresholds);
  const barW = Math.max(4, Math.round(prog * (TW - 20)));
  const iconSize = 22;

  return `<g transform="translate(${x},${y})">
    <!-- card surface (white overlay for subtle lift) -->
    <rect width="${TW}" height="${TH}" rx="7" fill="white" fill-opacity="0.05"/>
    <!-- top glow band -->
    <rect width="${TW}" height="46" rx="7" fill="${c}" fill-opacity="0.14"/>
    <rect y="40" width="${TW}" height="6" fill="${c}" fill-opacity="0.14"/>
    <!-- border -->
    <rect width="${TW}" height="${TH}" rx="7" fill="none" stroke="${c}" stroke-width="1.5"/>

    <!-- trophy cup (44px, centred) -->
    <g transform="translate(${midX - 22}, 3)">${trophyPath(44, c)}</g>

    <!-- tier badge -->
    <text x="${midX}" y="58" font-size="13" font-weight="700"
      text-anchor="middle" fill="${c}">${tier.label}</text>

    <!-- category icon -->
    <g transform="translate(${midX - iconSize / 2}, 63)">
      <svg viewBox="0 0 24 24" width="${iconSize}" height="${iconSize}">${catIcon(cat.icon, c)}</svg>
    </g>

    <!-- category name -->
    <text x="${midX}" y="98" font-size="9" font-weight="500"
      text-anchor="middle" fill="${c}" opacity="0.85">${encodeHTML(cat.title)}</text>

    <!-- value -->
    <text x="${midX}" y="112" font-size="12" font-weight="700"
      text-anchor="middle" fill="${c}">${displayValue}</text>

    <!-- progress bar track -->
    <rect x="10" y="${TH - 13}" width="${TW - 20}" height="4" rx="2"
      fill="${c}" fill-opacity="0.2"/>
    <!-- progress bar fill -->
    <rect x="10" y="${TH - 13}" width="${barW}" height="4" rx="2"
      fill="${c}"/>
  </g>`;
};

/**
 * Render the trophies card as an SVG string.
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

  const { titleColor, bgColor, borderColor } = getCardColors({
    title_color,
    text_color,
    icon_color: icon_color || "",
    bg_color,
    border_color,
    ring_color: title_color || "",
    theme,
  });

  const cols = Math.min(Math.max(parseInt(columns, 10) || COLS_DEFAULT, 1), 6);
  const rows = Math.ceil(CATEGORIES.length / cols);
  const cardW = PAD_X * 2 + cols * TW + (cols - 1) * GAP;
  const cardH = PAD_TOP + rows * TH + (rows - 1) * GAP + PAD_BOT;
  const title = encodeHTML(custom_title || `${statsData.name}'s GitHub Trophies`);

  const trophies = CATEGORIES.map((cat, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = PAD_X + col * (TW + GAP);
    const y = PAD_TOP + row * (TH + GAP);
    const value = cat.getValue(statsData);
    const displayValue = cat.formatValue ? cat.formatValue(statsData) : value.toLocaleString();
    const tierIdx = getTierIndex(value, cat.thresholds);
    return renderTrophy({ x, y, cat, value, displayValue, tierIdx });
  }).join("\n");

  return `<svg width="${cardW}" height="${cardH}" viewBox="0 0 ${cardW} ${cardH}"
  xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="trophy-title">
  <title id="trophy-title">${title}</title>
  <style>text { font-family: 'Segoe UI', Ubuntu, Sans-Serif; }</style>

  <rect x="0.5" y="0.5" rx="${border_radius}" ry="${border_radius}"
    width="${cardW - 1}" height="${cardH - 1}"
    fill="${bgColor}" stroke="${hide_border ? "none" : borderColor}"/>

  <text x="${cardW / 2}" y="27" font-size="14" font-weight="600"
    text-anchor="middle" fill="${titleColor}">${title}</text>

  ${trophies}
</svg>`;
};

export { renderTrophiesCard };
export default renderTrophiesCard;
