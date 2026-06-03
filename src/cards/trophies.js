// @ts-check
// Trophy icon paths from GitHub's trophy octicon (16×16 viewBox, MIT)
// Layout inspired by krishyadav90/github-profile-trophy

import { getCardColors } from "../common/color.js";
import { encodeHTML } from "../common/html.js";

const TW = 110;    // trophy card width  (matches krishyadav90's DEFAULT_PANEL_SIZE)
const TH = 110;    // trophy card height
const COLS_DEFAULT = 6;
const PAD_X = 14;
const PAD_TOP = 44;
const PAD_BOT = 14;
const GAP = 6;

// Catppuccin-accent tier palette with achievement labels
const TIERS = [
  { id: "SSS", label: "SSS", color: "#f9e2af", shadow: "#e0c87840", achievement: "Ultra Legend"  },
  { id: "SS",  label: "SS",  color: "#f38ba8", shadow: "#f38ba840", achievement: "Super Master"  },
  { id: "S",   label: "S",   color: "#cba6f7", shadow: "#cba6f740", achievement: "Expert"         },
  { id: "AAA", label: "AAA", color: "#89b4fa", shadow: "#89b4fa40", achievement: "Super Skilled"  },
  { id: "AA",  label: "AA",  color: "#94e2d5", shadow: "#94e2d540", achievement: "Skilled"        },
  { id: "A",   label: "A",   color: "#a6e3a1", shadow: "#a6e3a140", achievement: "Proficient"     },
  { id: "B",   label: "B",   color: "#89dceb", shadow: "#89dceb40", achievement: "Developing"     },
  { id: "C",   label: "C",   color: "#6c7086", shadow: "#6c708640", achievement: "Starting Out"   },
  { id: "?",   label: "?",   color: "#45475a", shadow: "#45475a40", achievement: "Unknown"        },
];

const CATEGORIES = [
  { title: "Total Commits",  getValue: (s) => s.totalCommits,  thresholds: [3000,2000,1000,500,200,100,50,10] },
  { title: "Total Stars",    getValue: (s) => s.totalStars,    thresholds: [500,200,100,50,30,10,5,1]         },
  { title: "Total PRs",      getValue: (s) => s.totalPRs,      thresholds: [500,300,200,100,50,20,10,1]       },
  { title: "Total Issues",   getValue: (s) => s.totalIssues,   thresholds: [200,100,50,30,20,10,5,1]          },
  { title: "Contributed To", getValue: (s) => s.contributedTo, thresholds: [100,70,50,30,20,10,5,1]           },
  {
    title: "Rank",
    getValue: (s) => { const m={"S+":8,S:7,"A++":6,"A+":5,A:4,B:3,C:2}; return m[s.rank?.level]??0; },
    thresholds: [8,7,6,5,4,3,2,1],
    formatValue: (s) => s.rank?.level || "?",
  },
];

const getTierIndex = (value, thresholds) => {
  for (let i = 0; i < thresholds.length; i++) if (value >= thresholds[i]) return i;
  return 8;
};

const tierProgress = (value, tierIdx, thresholds) => {
  if (tierIdx === 0) return 1;
  if (tierIdx >= thresholds.length) return Math.min(value / thresholds[thresholds.length - 1], 1);
  const lo = thresholds[tierIdx], hi = thresholds[tierIdx - 1];
  return Math.max(0, Math.min(1, (value - lo) / (hi - lo)));
};

/**
 * GitHub trophy octicon rendered as inline SVG at (ox, oy) with given size.
 * ViewBox is 0 0 16 16 — paths sourced from GitHub's trophy.svg.
 */
const githubTrophyIcon = (ox, oy, size, color) => `
  <svg x="${ox}" y="${oy}" width="${size}" height="${size}" viewBox="0 0 16 16" fill="${color}"
    xmlns="http://www.w3.org/2000/svg">
    <!-- cup body + base + stem -->
    <path d="M3 1h10c-.495 3.467-.5 10-5 10S3.495 4.467 3 1zm0 15a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1H3zm2-1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1H5z"/>
    <!-- stem block -->
    <path d="M7 10h2v4H7v-4z"/>
    <!-- base decoration -->
    <path d="M10 11c0 .552-.895 1-2 1s-2-.448-2-1 .895-1 2-1 2 .448 2 1z"/>
    <!-- left & right handles -->
    <path fill-rule="evenodd" d="M12.5 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-3 2a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm-6-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-3 2a3 3 0 1 1 6 0 3 3 0 0 1-6 0z"/>
  </svg>`;

/** Rank badge circle with letter, positioned at top-left of card. */
const rankBadge = (color, label) => `
  <circle cx="18" cy="18" r="12" fill="${color}" opacity="0.18"/>
  <circle cx="18" cy="18" r="12" fill="none" stroke="${color}" stroke-width="1.2"/>
  <text x="18" y="18" font-size="${label.length > 1 ? "6.5" : "8"}" font-weight="700"
    text-anchor="middle" dominant-baseline="middle" fill="${color}">${label}</text>`;

const renderTrophy = ({ x, y, cat, value, displayValue, tierIdx }) => {
  const tier = TIERS[tierIdx];
  const c = tier.color;
  const midX = TW / 2;   // 55
  const iconSize = 52;
  const iconX = midX - iconSize / 2;  // 29
  const iconY = 12;

  const prog = tierProgress(value, tierIdx, cat.thresholds);
  const barW = Math.max(3, Math.round(prog * (TW - 20)));
  const barY = TH - 9;

  return `<g transform="translate(${x},${y})">
  <!-- card surface -->
  <rect width="${TW}" height="${TH}" rx="8" fill="white" fill-opacity="0.04"/>
  <!-- glow bg -->
  <rect width="${TW}" height="${TH}" rx="8" fill="${c}" fill-opacity="0.08"/>
  <!-- border -->
  <rect width="${TW}" height="${TH}" rx="8" fill="none" stroke="${c}" stroke-width="1.5"/>

  <!-- rank badge (top-left) -->
  ${rankBadge(c, tier.label)}

  <!-- trophy icon (GitHub octicon, centred) -->
  ${githubTrophyIcon(iconX, iconY, iconSize, c)}

  <!-- category title -->
  <text x="${midX}" y="75" font-size="10" font-weight="600"
    text-anchor="middle" fill="${c}">${encodeHTML(cat.title)}</text>

  <!-- achievement label -->
  <text x="${midX}" y="87" font-size="8.5" font-style="italic"
    text-anchor="middle" fill="${c}" opacity="0.75">${tier.achievement}</text>

  <!-- value -->
  <text x="${midX}" y="100" font-size="12" font-weight="700"
    text-anchor="middle" fill="${c}">${displayValue}</text>

  <!-- progress bar track -->
  <rect x="10" y="${barY}" width="${TW - 20}" height="3.5" rx="1.75"
    fill="${c}" fill-opacity="0.2"/>
  <!-- progress bar fill -->
  <rect x="10" y="${barY}" width="${barW}" height="3.5" rx="1.75" fill="${c}"/>
</g>`;
};

const renderTrophiesCard = (statsData, options = {}) => {
  const {
    theme = "default",
    title_color, text_color, bg_color, border_color, icon_color,
    hide_border = false, border_radius = 4.5,
    custom_title, columns,
  } = options;

  const { titleColor, bgColor, borderColor } = getCardColors({
    title_color, text_color, icon_color: icon_color || "",
    bg_color, border_color, ring_color: title_color || "", theme,
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
  <style>text { font-family: 'Segoe UI', Ubuntu, sans-serif; }</style>

  <rect x="0.5" y="0.5" rx="${border_radius}" ry="${border_radius}"
    width="${cardW - 1}" height="${cardH - 1}"
    fill="${bgColor}" stroke="${hide_border ? "none" : borderColor}"/>

  <text x="${cardW / 2}" y="26" font-size="14" font-weight="600"
    text-anchor="middle" fill="${titleColor}">${title}</text>

  ${trophies}
</svg>`;
};

export { renderTrophiesCard };
export default renderTrophiesCard;
