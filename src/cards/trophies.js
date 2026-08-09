// @ts-check
// Ported from krishyadav90/github-profile-trophy (TypeScript → JS)
// Exact SVG structure from src/trophy.ts and src/icons.ts

import { encodeHTML } from "../common/html.js";

// Catppuccin Mocha theme (no catppuccin in original repo, we add it)
const CATPPUCCIN_MOCHA = {
  BACKGROUND:        "#1e1e2e",
  TITLE:             "#94e2d5",
  ICON_CIRCLE:       "#1e1e2e",
  TEXT:              "#cdd6f4",
  LAUREL:            "#a6e3a1",
  SECRET_RANK_1:     "#f38ba8",
  SECRET_RANK_2:     "#cba6f7",
  SECRET_RANK_3:     "#89b4fa",
  SECRET_RANK_TEXT:  "#cba6f7",
  NEXT_RANK_BAR:     "#94e2d5",
  S_RANK_BASE:       "#f9e2af",
  S_RANK_SHADOW:     "#e0c878",
  S_RANK_TEXT:       "#1e1e2e",
  A_RANK_BASE:       "#89b4fa",
  A_RANK_SHADOW:     "#6c9ce0",
  A_RANK_TEXT:       "#1e1e2e",
  B_RANK_BASE:       "#89dceb",
  B_RANK_SHADOW:     "#5bbccc",
  B_RANK_TEXT:       "#1e1e2e",
  DEFAULT_RANK_BASE:   "#6c7086",
  DEFAULT_RANK_SHADOW: "#45475a",
  DEFAULT_RANK_TEXT:   "#cdd6f4",
};

// Exact icon paths from icons.ts (16-unit coordinate space, placed in 30×30 viewBox)
const TROPHY_ICON_PATHS = `
  <path d="M7 10h2v4H7v-4z"/>
  <path d="M10 11c0 .552-.895 1-2 1s-2-.448-2-1 .895-1 2-1 2 .448 2 1z"/>
  <path fill-rule="evenodd" d="M12.5 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-3 2a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm-6-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-3 2a3 3 0 1 1 6 0 3 3 0 0 1-6 0z"/>
  <path d="M3 1h10c-.495 3.467-.5 10-5 10S3.495 4.467 3 1zm0 15a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1H3zm2-1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1H5z"/>`;

// Leaf/laurel SVG from icons.ts (shown behind trophy for S and A ranks)
const leafSvg = (color) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="90" height="90"
    viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
    <g transform="translate(20,60) scale(0.004,-0.004)" fill="${color}" stroke="none">
      <path d="M200 5103 c0 -2 18 -40 41 -84 47 -95 62 -132 50 -125 -15 10 -18 -39 -6 -87 31 -121 265 -468 412 -608 124 -119 281 -222 383 -251 36 -10 49 -16 30 -13 -19 3 -78 12 -130 20 -117 17 -353 35 -477 35 l-93 0 53 -82 c72 -112 72 -112 59 -104 -18 11 -26 -41 -13 -84 25 -84 261 -376 404 -502 95 -83 222 -168 304 -205 98 -43 194 -73 242 -74 l46 -1 -45 -8 c-25 -5 -124 -21 -220 -36 -96 -15 -177 -29 -180 -31 -2 -2 0 -7 5 -11 27 -19 138 -144 123 -139 -18 6 -28 -10 -28 -47 0 -38 53 -108 141 -187 349 -313 631 -450 939 -453 63 0 131 2 150 7 19 4 -35 -17 -120 -46 -236 -82 -310 -110 -310 -117 0 -3 29 -28 65 -54 55 -40 102 -84 67 -62 -13 8 -32 -24 -32 -54 0 -99 486 -361 790 -426 125 -27 327 -25 444 4 113 28 261 98 309 145 39 40 56 92 38 124 -8 17 -4 24 29 49 22 16 40 32 40 36 0 4 -26 40 -58 80 -162 203 -368 328 -608 369 -89 15 -368 6 -474 -15 -131 -26 -147 -26 -59 -3 51 13 102 34 122 50 38 29 61 84 51 123 -5 18 1 26 25 39 17 8 31 19 31 23 0 4 -16 38 -35 75 -163 317 -424 501 -781 548 -113 15 -127 19 -91 30 51 14 84 58 89 118 1 20 9 33 20 37 23 7 23 6 -12 114 -108 329 -305 534 -640 662 -41 15 -59 25 -40 21 19 -5 82 -8 140 -8 81 0 113 4 142 18 39 20 73 76 65 107 -3 12 2 20 14 23 23 6 23 21 4 124 -61 320 -249 568 -544 718 -157 79 -394 147 -666 190 -88 13 -170 26 -182 29 -13 2 -23 2 -23 -1z"/>
    </g>
  </svg>`;

const RANK = { SSS:"SSS", SS:"SS", S:"S", AAA:"AAA", AA:"AA", A:"A", B:"B", C:"C", UNKNOWN:"?" };

// Achievement messages from trophy.ts (exact text)
const TROPHIES = [
  {
    title: "Commits",
    getValue: (s) => s.totalCommits,
    ranks: [
      { rank: RANK.SSS, msg: "God Committer",   score: 4000 },
      { rank: RANK.SS,  msg: "Deep Committer",  score: 2000 },
      { rank: RANK.S,   msg: "Super Committer", score: 1000 },
      { rank: RANK.AAA, msg: "Ultra Committer", score: 500  },
      { rank: RANK.AA,  msg: "Hyper Committer", score: 200  },
      { rank: RANK.A,   msg: "High Committer",  score: 100  },
      { rank: RANK.B,   msg: "Middle Committer",score: 10   },
      { rank: RANK.C,   msg: "First Commit",    score: 1    },
    ],
  },
  {
    title: "Stars",
    getValue: (s) => s.totalStars,
    ranks: [
      { rank: RANK.SSS, msg: "Super Stargazer", score: 2000 },
      { rank: RANK.SS,  msg: "High Stargazer",  score: 700  },
      { rank: RANK.S,   msg: "Stargazer",       score: 200  },
      { rank: RANK.AAA, msg: "Super Star",      score: 100  },
      { rank: RANK.AA,  msg: "High Star",       score: 50   },
      { rank: RANK.A,   msg: "You are a Star",  score: 30   },
      { rank: RANK.B,   msg: "Middle Star",     score: 10   },
      { rank: RANK.C,   msg: "First Star",      score: 1    },
    ],
  },
  {
    title: "PullRequest",
    getValue: (s) => s.totalPRs,
    ranks: [
      { rank: RANK.SSS, msg: "God Puller",    score: 1000 },
      { rank: RANK.SS,  msg: "Deep Puller",   score: 500  },
      { rank: RANK.S,   msg: "Super Puller",  score: 200  },
      { rank: RANK.AAA, msg: "Ultra Puller",  score: 100  },
      { rank: RANK.AA,  msg: "Hyper Puller",  score: 50   },
      { rank: RANK.A,   msg: "High Puller",   score: 20   },
      { rank: RANK.B,   msg: "Middle Puller", score: 10   },
      { rank: RANK.C,   msg: "First Pull",    score: 1    },
    ],
  },
  {
    title: "Issues",
    getValue: (s) => s.totalIssues,
    ranks: [
      { rank: RANK.SSS, msg: "God Issuer",    score: 1000 },
      { rank: RANK.SS,  msg: "Deep Issuer",   score: 500  },
      { rank: RANK.S,   msg: "Super Issuer",  score: 200  },
      { rank: RANK.AAA, msg: "Ultra Issuer",  score: 100  },
      { rank: RANK.AA,  msg: "Hyper Issuer",  score: 50   },
      { rank: RANK.A,   msg: "High Issuer",   score: 20   },
      { rank: RANK.B,   msg: "Middle Issuer", score: 10   },
      { rank: RANK.C,   msg: "First Issue",   score: 1    },
    ],
  },
  {
    title: "Repositories",
    getValue: (s) => s.contributedTo,
    ranks: [
      { rank: RANK.SSS, msg: "God Repo Creator",    score: 100 },
      { rank: RANK.SS,  msg: "Deep Repo Creator",   score: 90  },
      { rank: RANK.S,   msg: "Super Repo Creator",  score: 80  },
      { rank: RANK.AAA, msg: "Ultra Repo Creator",  score: 50  },
      { rank: RANK.AA,  msg: "Hyper Repo Creator",  score: 30  },
      { rank: RANK.A,   msg: "High Repo Creator",   score: 20  },
      { rank: RANK.B,   msg: "Middle Repo Creator", score: 10  },
      { rank: RANK.C,   msg: "First Repository",    score: 1   },
    ],
  },
  {
    title: "Followers",
    getValue: (s) => s.rank?.percentile != null ? Math.round((1 - s.rank.percentile / 100) * 100) : 0,
    ranks: [
      { rank: RANK.SSS, msg: "Super Celebrity", score: 90 },
      { rank: RANK.SS,  msg: "Ultra Celebrity", score: 80 },
      { rank: RANK.S,   msg: "Hyper Celebrity", score: 70 },
      { rank: RANK.AAA, msg: "Famous User",     score: 60 },
      { rank: RANK.AA,  msg: "Active User",     score: 50 },
      { rank: RANK.A,   msg: "Dynamic User",    score: 40 },
      { rank: RANK.B,   msg: "Many Friends",    score: 20 },
      { rank: RANK.C,   msg: "First Friend",    score: 1  },
    ],
    formatValue: (s) => s.rank?.level || "?",
  },
];

const getRankInfo = (score, rankDefs) => {
  const sorted = [...rankDefs].sort((a, b) => b.score - a.score);
  const hit = sorted.find((r) => score >= r.score);
  return hit || { rank: RANK.UNKNOWN, msg: "Unknown" };
};

const getNextRankBar = (title, percentage, color) => {
  const maxWidth = 80;
  const filled = (maxWidth * Math.min(1, Math.max(0, percentage))).toFixed(1);
  return `
  <style>
    @keyframes ${title}RankAnim { from { width: 0px; } to { width: ${filled}px; } }
    #${title}-rank-progress { animation: ${title}RankAnim 1s forwards ease-in-out; }
  </style>
  <rect x="15" y="101" rx="1" width="${maxWidth}" height="3.2" opacity="0.3" fill="${color}"/>
  <rect id="${title}-rank-progress" x="15" y="101" rx="1" height="3.2" fill="${color}"/>`;
};

const getNextRankPercentage = (score, rank, rankDefs) => {
  if (rank === RANK.UNKNOWN) return 0;
  const sorted = [...rankDefs].sort((a, b) => b.score - a.score);
  const idx = sorted.findIndex((r) => r.rank === rank);
  if (idx <= 0) return 1; // already max
  const current = sorted[idx];
  const next = sorted[idx - 1];
  return Math.min(1, (score - current.score) / (next.score - current.score));
};

const getTrophyIcon = (rankStr, theme) => {
  let color = theme.DEFAULT_RANK_BASE;
  let rankColor = theme.DEFAULT_RANK_TEXT;
  let shadow = theme.DEFAULT_RANK_SHADOW;
  let bg = "";

  const first = rankStr.slice(0, 1);
  if (first === "S") {
    color = theme.S_RANK_BASE;
    shadow = theme.S_RANK_SHADOW;
    rankColor = theme.S_RANK_TEXT;
    bg = leafSvg(theme.LAUREL);
  } else if (first === "A") {
    color = theme.A_RANK_BASE;
    shadow = theme.A_RANK_SHADOW;
    rankColor = theme.A_RANK_TEXT;
    bg = leafSvg(theme.LAUREL);
  } else if (rankStr === "B") {
    color = theme.B_RANK_BASE;
    shadow = theme.B_RANK_SHADOW;
    rankColor = theme.B_RANK_TEXT;
  }

  const gradId = `grad-${rankStr.replace(/[^a-zA-Z0-9]/g, "_")}`;
  return `${bg}
  <defs>
    <linearGradient id="${gradId}" gradientTransform="rotate(45)">
      <stop offset="0%"   stop-color="${color}"/>
      <stop offset="70%"  stop-color="${color}"/>
      <stop offset="100%" stop-color="${shadow}"/>
    </linearGradient>
  </defs>
  <svg x="28" y="20" width="100" height="100" viewBox="0 0 30 30"
    fill="url(#${gradId})" xmlns="http://www.w3.org/2000/svg">
    ${TROPHY_ICON_PATHS}
    <circle cx="8" cy="6" r="4" fill="${theme.ICON_CIRCLE}"/>
    <text x="6" y="8" font-family="Courier, Monospace" font-size="7"
      fill="${rankColor}">${rankStr.slice(0, 1)}</text>
  </svg>`;
};

const renderOneTrophy = (trophy, statsData, theme, x, y, panelSize = 110) => {
  const score = trophy.getValue(statsData);
  const { rank, msg } = getRankInfo(score, trophy.ranks);
  const displayValue = trophy.formatValue ? trophy.formatValue(statsData) : score.toLocaleString();
  const percentage = getNextRankPercentage(score, rank, trophy.ranks);
  const rankBar = getNextRankBar(trophy.title, percentage, theme.NEXT_RANK_BAR);

  return `<svg x="${x}" y="${y}" width="${panelSize}" height="${panelSize}"
    viewBox="0 0 ${panelSize} ${panelSize}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.5" y="0.5" rx="4.5" width="${panelSize - 1}" height="${panelSize - 1}"
      stroke="#e1e4e8" fill="${theme.BACKGROUND}" stroke-opacity="1"/>
    ${getTrophyIcon(rank, theme)}
    <text x="50%" y="18" text-anchor="middle"
      font-family="Segoe UI,Helvetica,Arial,sans-serif"
      font-weight="bold" font-size="13" fill="${theme.TITLE}">${encodeHTML(trophy.title)}</text>
    <text x="50%" y="85" text-anchor="middle"
      font-family="Segoe UI,Helvetica,Arial,sans-serif"
      font-weight="bold" font-size="10.5" fill="${theme.TEXT}">${encodeHTML(msg)}</text>
    <text x="50%" y="97" text-anchor="middle"
      font-family="Segoe UI,Helvetica,Arial,sans-serif"
      font-weight="bold" font-size="10" fill="${theme.TEXT}">${encodeHTML(displayValue)}</text>
    ${rankBar}
  </svg>`;
};

const renderTrophiesCard = (statsData, options = {}) => {
  const { columns, custom_title } = options;
  const theme = CATPPUCCIN_MOCHA;
  const panelSize = 110;
  const cols = Math.min(Math.max(parseInt(columns, 10) || 6, 1), 8);
  const rows = Math.ceil(TROPHIES.length / cols);
  const totalW = panelSize * cols;
  const totalH = panelSize * rows;
  const title = encodeHTML(custom_title || `${statsData.name}'s GitHub Trophies`);

  // Title bar above the trophies
  const titleH = 32;
  const cardW = totalW;
  const cardH = titleH + totalH;

  const trophySvgs = TROPHIES.map((t, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return renderOneTrophy(t, statsData, theme, col * panelSize, titleH + row * panelSize, panelSize);
  }).join("\n");

  return `<svg width="${cardW}" height="${cardH}" viewBox="0 0 ${cardW} ${cardH}"
  fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${cardW}" height="${cardH}" fill="${theme.BACKGROUND}"/>
  <text x="50%" y="22" text-anchor="middle"
    font-family="Segoe UI,Helvetica,Arial,sans-serif"
    font-weight="bold" font-size="14" fill="${theme.TITLE}">${title}</text>
  ${trophySvgs}
</svg>`;
};

export { renderTrophiesCard };
export default renderTrophiesCard;
