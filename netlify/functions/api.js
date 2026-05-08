import gistCard from "../../api/gist.js";
import statsCard from "../../api/index.js";
import repoCard from "../../api/pin.js";
import statusPatInfo from "../../api/status/pat-info.js";
import statusUp from "../../api/status/up.js";
import langCard from "../../api/top-langs.js";
import wakatimeCard from "../../api/wakatime.js";

const routes = {
  "/api": statsCard,
  "/api/": statsCard,
  "/api/pin": repoCard,
  "/api/top-langs": langCard,
  "/api/wakatime": wakatimeCard,
  "/api/gist": gistCard,
  "/api/status/up": statusUp,
  "/api/status/pat-info": statusPatInfo,
};

const createResponse = () => {
  const headers = {};
  let statusCode = 200;
  let body = "";

  return {
    setHeader(name, value) {
      headers[name] = value;
    },
    status(code) {
      statusCode = code;
      return this;
    },
    send(value) {
      if (typeof value === "string") {
        body = value;
      } else {
        body = JSON.stringify(value);
      }
      return {
        statusCode,
        headers,
        body,
      };
    },
  };
};

const getRoutePath = (event) => {
  const path = event.rawUrl ? new URL(event.rawUrl).pathname : event.path;

  if (path.startsWith("/.netlify/functions/api")) {
    const suffix = path.replace("/.netlify/functions/api", "");
    return suffix ? `/api${suffix}` : "/api";
  }

  return path;
};

export const handler = async (event) => {
  const routePath = getRoutePath(event);
  const route = routes[routePath];

  if (!route) {
    return {
      statusCode: 404,
      headers: { "Content-Type": "text/plain" },
      body: "Not found",
    };
  }

  const req = {
    headers: event.headers || {},
    method: event.httpMethod,
    path: routePath,
    query: event.queryStringParameters || {},
    url: event.rawUrl || event.path,
  };
  const res = createResponse();

  return route(req, res);
};
