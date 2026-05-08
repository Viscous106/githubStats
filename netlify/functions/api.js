import express from "express";
import serverless from "serverless-http";

import gistCard from "../../api/gist.js";
import statsCard from "../../api/index.js";
import repoCard from "../../api/pin.js";
import statusPatInfo from "../../api/status/pat-info.js";
import statusUp from "../../api/status/up.js";
import langCard from "../../api/top-langs.js";
import wakatimeCard from "../../api/wakatime.js";

const app = express();
const router = express.Router();

router.get("/", statsCard);
router.get("/pin", repoCard);
router.get("/top-langs", langCard);
router.get("/wakatime", wakatimeCard);
router.get("/gist", gistCard);
router.get("/status/up", statusUp);
router.get("/status/pat-info", statusPatInfo);

app.use("/api", router);

export const handler = serverless(app);
