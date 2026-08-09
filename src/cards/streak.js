// @ts-check
// Ported from DenverCoder1/github-readme-streak-stats (PHP → JS)
// Exact coordinates from tests/expected/test_card.svg

import { getCardColors } from "../common/color.js";
import { encodeHTML } from "../common/html.js";

// Exact demolab fire path (centred at origin, height ≈ 22 units)
const FIRE_PATH = "M 1.5 0.67 C 1.5 0.67 2.24 3.32 2.24 5.47 C 2.24 7.53 0.89 9.2 -1.17 9.2 C -3.23 9.2 -4.79 7.53 -4.79 5.47 L -4.76 5.11 C -6.78 7.51 -8 10.62 -8 13.99 C -8 18.41 -4.42 22 0 22 C 4.42 22 8 18.41 8 13.99 C 8 8.6 5.41 3.79 1.5 0.67 Z M -0.29 19 C -2.07 19 -3.51 17.6 -3.51 15.86 C -3.51 14.24 -2.46 13.1 -0.7 12.74 C 1.07 12.38 2.9 11.53 3.92 10.16 C 4.31 11.45 4.51 12.81 4.51 14.2 C 4.51 16.85 2.36 19 -0.29 19 Z";

const fmtDate = (dateStr) => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d))
    .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
};

const renderStreakCard = (streakData, options = {}) => {
  const {
    theme = "default",
    title_color, text_color, bg_color, border_color, icon_color, ring_color,
    hide_border = false, border_radius = 4.5,
    disable_animations = false,
  } = options;

  const { titleColor, textColor, bgColor, borderColor, ringColor } = getCardColors({
    title_color, text_color, icon_color: icon_color || "",
    bg_color, border_color,
    ring_color: ring_color || title_color || "",
    theme,
  });

  const {
    currentStreak, longestStreak, totalContributions,
    currentStreakStart, currentStreakEnd,
    longestStreakStart, longestStreakEnd,
  } = streakData;

  const contribRange = totalContributions > 0
    ? (currentStreakStart ? `${fmtDate(currentStreakStart?.replace(/.*/, ""))} - Present` : "Present")
    : "N/A";
  const currentRange = currentStreak > 0
    ? `${fmtDate(currentStreakStart)} - ${fmtDate(currentStreakEnd)}`
    : "No current streak";
  const longestRange = longestStreak > 0
    ? `${fmtDate(longestStreakStart)} - ${fmtDate(longestStreakEnd)}`
    : "No streak yet";

  const anim = (name, delay) => disable_animations
    ? `opacity: 1`
    : `opacity: 0; animation: fadein 0.5s linear forwards ${delay}s`;

  const currAnim = disable_animations
    ? `font-size: 28px; opacity: 1`
    : `animation: currstreak 0.6s linear forwards`;

  const css = disable_animations ? "" : `
    @keyframes currstreak {
      0%   { font-size: 3px;  opacity: 0.2; }
      80%  { font-size: 34px; opacity: 1;   }
      100% { font-size: 28px; opacity: 1;   }
    }
    @keyframes fadein {
      0%   { opacity: 0; }
      100% { opacity: 1; }
    }`;

  // Exact demolab dimensions: 495 × 195
  return `<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'
  style='isolation: isolate' viewBox='0 0 495 195' width='495px' height='195px' direction='ltr'>
  <style>${css}</style>
  <defs>
    <clipPath id='outer_rectangle'>
      <rect width='495' height='195' rx='${border_radius}'/>
    </clipPath>
    <mask id='mask_out_ring_behind_fire'>
      <rect width='495' height='195' fill='white'/>
      <ellipse id='mask-ellipse' cx='247.5' cy='32' rx='13' ry='18' fill='black'/>
    </mask>
  </defs>
  <g clip-path='url(#outer_rectangle)'>
    <g style='isolation: isolate'>
      <rect stroke='${borderColor}' fill='${bgColor}' rx='${border_radius}'
        x='0.5' y='0.5' width='494' height='194'
        stroke-opacity='${hide_border ? "0" : "1"}'/>
    </g>
    <g style='isolation: isolate'>
      <line x1='165' y1='28' x2='165' y2='170' vector-effect='non-scaling-stroke'
        stroke-width='1' stroke='${borderColor}' stroke-opacity='0.35'
        stroke-linecap='square' stroke-miterlimit='3'/>
      <line x1='330' y1='28' x2='330' y2='170' vector-effect='non-scaling-stroke'
        stroke-width='1' stroke='${borderColor}' stroke-opacity='0.35'
        stroke-linecap='square' stroke-miterlimit='3'/>
    </g>

    <!-- Total Contributions -->
    <g style='isolation: isolate'>
      <g transform='translate(82.5, 48)'>
        <text x='0' y='32' stroke-width='0' text-anchor='middle'
          fill='${titleColor}' stroke='none'
          font-family='"Segoe UI", Ubuntu, sans-serif' font-weight='700' font-size='28px'
          style='${anim("fadein", 0.6)}'>${totalContributions.toLocaleString()}</text>
      </g>
      <g transform='translate(82.5, 84)'>
        <text x='0' y='32' stroke-width='0' text-anchor='middle'
          fill='${textColor}' stroke='none'
          font-family='"Segoe UI", Ubuntu, sans-serif' font-weight='400' font-size='14px'
          style='${anim("fadein", 0.7)}'>Total Contributions</text>
      </g>
      <g transform='translate(82.5, 114)'>
        <text x='0' y='32' stroke-width='0' text-anchor='middle'
          fill='${textColor}' stroke='none' opacity='0.7'
          font-family='"Segoe UI", Ubuntu, sans-serif' font-weight='400' font-size='12px'
          style='${anim("fadein", 0.8)}'>Last 12 months</text>
      </g>
    </g>

    <!-- Current Streak -->
    <g style='isolation: isolate'>
      <g transform='translate(247.5, 108)'>
        <text x='0' y='32' stroke-width='0' text-anchor='middle'
          fill='${textColor}' stroke='none'
          font-family='"Segoe UI", Ubuntu, sans-serif' font-weight='700' font-size='14px'
          style='${anim("fadein", 0.9)}'>Current Streak</text>
      </g>
      <g transform='translate(247.5, 145)'>
        <text x='0' y='21' stroke-width='0' text-anchor='middle'
          fill='${textColor}' stroke='none' opacity='0.7'
          font-family='"Segoe UI", Ubuntu, sans-serif' font-weight='400' font-size='12px'
          style='${anim("fadein", 0.9)}'>${encodeHTML(currentRange)}</text>
      </g>
      <g mask='url(#mask_out_ring_behind_fire)'>
        <circle cx='247.5' cy='71' r='40' fill='none' stroke='${ringColor}'
          stroke-width='5' style='${anim("fadein", 0.4)}'/>
      </g>
      <g transform='translate(247.5, 19.5)' stroke-opacity='0'
        style='${anim("fadein", 0.6)}'>
        <path d='M -12 -0.5 L 15 -0.5 L 15 23.5 L -12 23.5 L -12 -0.5 Z' fill='none'/>
        <path d='${FIRE_PATH}' fill='${ringColor}' stroke-opacity='0'/>
      </g>
      <g transform='translate(247.5, 48)'>
        <text x='0' y='32' stroke-width='0' text-anchor='middle'
          fill='${ringColor}' stroke='none'
          font-family='"Segoe UI", Ubuntu, sans-serif' font-weight='700' font-size='28px'
          style='${currAnim}'>${currentStreak}</text>
      </g>
    </g>

    <!-- Longest Streak -->
    <g style='isolation: isolate'>
      <g transform='translate(412.5, 48)'>
        <text x='0' y='32' stroke-width='0' text-anchor='middle'
          fill='${titleColor}' stroke='none'
          font-family='"Segoe UI", Ubuntu, sans-serif' font-weight='700' font-size='28px'
          style='${anim("fadein", 1.2)}'>${longestStreak}</text>
      </g>
      <g transform='translate(412.5, 84)'>
        <text x='0' y='32' stroke-width='0' text-anchor='middle'
          fill='${textColor}' stroke='none'
          font-family='"Segoe UI", Ubuntu, sans-serif' font-weight='400' font-size='14px'
          style='${anim("fadein", 1.3)}'>Longest Streak</text>
      </g>
      <g transform='translate(412.5, 114)'>
        <text x='0' y='32' stroke-width='0' text-anchor='middle'
          fill='${textColor}' stroke='none' opacity='0.7'
          font-family='"Segoe UI", Ubuntu, sans-serif' font-weight='400' font-size='12px'
          style='${anim("fadein", 1.4)}'>${encodeHTML(longestRange)}</text>
      </g>
    </g>
  </g>
</svg>`;
};

export { renderStreakCard };
export default renderStreakCard;
