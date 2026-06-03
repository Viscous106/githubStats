// @ts-check

import { retryer } from "../common/retryer.js";
import { request } from "../common/http.js";
import { MissingParamError, CustomError } from "../common/error.js";
import githubUsernameRegex from "github-username-regex";

const STREAK_QUERY = `
  query streakInfo($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

const fetcher = (variables, token) =>
  request({ query: STREAK_QUERY, variables }, { Authorization: `bearer ${token}` });

/**
 * Calculate current streak, longest streak, and total contributions from sorted days.
 *
 * @param {{ date: string, contributionCount: number }[]} days Sorted ascending by date.
 * @returns {{ currentStreak: number, longestStreak: number, totalContributions: number, currentStreakStart: string, currentStreakEnd: string, longestStreakStart: string, longestStreakEnd: string }}
 */
const calculateStreaks = (days) => {
  const todayUTC = new Date().toISOString().slice(0, 10);

  // Build a fast lookup map
  const countByDate = {};
  for (const d of days) {
    countByDate[d.date] = d.contributionCount;
  }

  // Current streak: walk backwards from today (skip today if 0 so an incomplete day doesn't break it)
  let streakEnd = todayUTC;
  if ((countByDate[todayUTC] || 0) === 0) {
    // move back one day
    const yesterday = new Date(todayUTC + "T00:00:00Z");
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    streakEnd = yesterday.toISOString().slice(0, 10);
  }

  let currentStreak = 0;
  let currentStreakStart = streakEnd;
  let currentStreakEnd = streakEnd;

  // walk back from streakEnd
  let cursor = new Date(streakEnd + "T00:00:00Z");
  while (true) {
    const dateStr = cursor.toISOString().slice(0, 10);
    if ((countByDate[dateStr] || 0) > 0) {
      currentStreak++;
      currentStreakStart = dateStr;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    } else {
      break;
    }
  }

  // Longest streak: scan all days
  let longestStreak = 0;
  let longestStreakStart = "";
  let longestStreakEnd = "";
  let runLen = 0;
  let runStart = "";

  for (const day of days) {
    if (day.contributionCount > 0) {
      runLen++;
      if (runLen === 1) runStart = day.date;
      if (runLen > longestStreak) {
        longestStreak = runLen;
        longestStreakStart = runStart;
        longestStreakEnd = day.date;
      }
    } else {
      runLen = 0;
    }
  }

  const totalContributions = days.reduce((s, d) => s + d.contributionCount, 0);

  return {
    currentStreak,
    longestStreak,
    totalContributions,
    currentStreakStart,
    currentStreakEnd,
    longestStreakStart,
    longestStreakEnd,
  };
};

/**
 * Fetch streak data for a GitHub user.
 *
 * @param {string} username GitHub username.
 * @returns {Promise<object>} Streak data.
 */
const fetchStreak = async (username) => {
  if (!username) throw new MissingParamError(["username"]);
  if (!githubUsernameRegex.test(username)) {
    throw new CustomError("Invalid username provided.", "INVALID_USERNAME");
  }

  // Fetch the last 365 days
  const to = new Date();
  const from = new Date(to);
  from.setFullYear(from.getFullYear() - 1);

  const res = await retryer(fetcher, {
    login: username,
    from: from.toISOString(),
    to: to.toISOString(),
  });

  if (res.data.errors) {
    const err = res.data.errors[0];
    if (err.type === "NOT_FOUND") {
      throw new CustomError(err.message || "Could not fetch user.", CustomError.USER_NOT_FOUND);
    }
    throw new CustomError(err.message || "GraphQL error", CustomError.GRAPHQL_ERROR);
  }

  const calendar = res.data.data.user.contributionsCollection.contributionCalendar;
  const days = calendar.weeks.flatMap((w) => w.contributionDays);

  return calculateStreaks(days);
};

export { fetchStreak };
export default fetchStreak;
