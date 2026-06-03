// @ts-check

import { renderTrophiesCard } from "../src/cards/trophies.js";
import { guardAccess } from "../src/common/access.js";
import {
  CACHE_TTL,
  resolveCacheSeconds,
  setCacheHeaders,
  setErrorCacheHeaders,
} from "../src/common/cache.js";
import { MissingParamError, retrieveSecondaryMessage } from "../src/common/error.js";
import { parseBoolean, parseArray } from "../src/common/ops.js";
import { renderError } from "../src/common/render.js";
import { fetchStats } from "../src/fetchers/stats.js";

// @ts-ignore
export default async (req, res) => {
  const {
    username,
    theme,
    title_color,
    text_color,
    bg_color,
    border_color,
    icon_color,
    hide_border,
    border_radius,
    custom_title,
    cache_seconds,
    columns,
    show,
  } = req.query;

  res.setHeader("Content-Type", "image/svg+xml");

  const access = guardAccess({
    res,
    id: username,
    type: "username",
    colors: { title_color, text_color, bg_color, border_color, theme },
  });
  if (!access.isPassed) return access.result;

  try {
    const showStats = parseArray(show);
    const stats = await fetchStats(
      username,
      false,
      [],
      showStats.includes("prs_merged"),
      false,
      false,
    );

    const cacheSeconds = resolveCacheSeconds({
      requested: parseInt(cache_seconds, 10),
      def: CACHE_TTL.STATS_CARD.DEFAULT,
      min: CACHE_TTL.STATS_CARD.MIN,
      max: CACHE_TTL.STATS_CARD.MAX,
    });
    setCacheHeaders(res, cacheSeconds);

    return res.send(
      renderTrophiesCard(stats, {
        theme,
        title_color,
        text_color,
        bg_color,
        border_color,
        icon_color,
        hide_border: parseBoolean(hide_border),
        border_radius,
        custom_title,
        columns,
      }),
    );
  } catch (err) {
    setErrorCacheHeaders(res);
    if (err instanceof Error) {
      return res.send(
        renderError({
          message: err.message,
          secondaryMessage: retrieveSecondaryMessage(err),
          renderOptions: { title_color, text_color, bg_color, border_color, theme },
        }),
      );
    }
    return res.send(
      renderError({
        message: "An unknown error occurred",
        renderOptions: { title_color, text_color, bg_color, border_color, theme },
      }),
    );
  }
};
