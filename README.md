# github-readme-stats

Dynamically generate GitHub stats cards for your README, self-hosted on Vercel.

Based on [anuraghazra/github-readme-stats](https://github.com/anuraghazra/github-readme-stats), personalised and deployed by [Viscous106](https://github.com/Viscous106).

---

## Cards available

| Endpoint | What it renders |
|----------|----------------|
| `/api?username=<user>` | Stats card (stars, commits, PRs, issues, contribs) |
| `/api/pin?username=<user>&repo=<repo>` | Pinned repo card |
| `/api/top-langs?username=<user>` | Top languages card |
| `/api/wakatime?username=<user>` | WakaTime coding activity |
| `/api/gist?id=<gist_id>` | Gist card |
| `/api/status/up` | Health check |
| `/api/status/pat-info` | PAT token status |

## Local development

```bash
# 1. copy env template and fill in your PAT
cp .env.example .env
# edit .env → set PAT_1=ghp_...

# 2. install dependencies
npm install

# 3. start dev server
npm start        # http://localhost:9000

# 4. run tests
npm test
```

## Deploy to Vercel

```bash
npx vercel --yes                              # first deploy (sets up project)
npx vercel env add PAT_1 production           # add your GitHub PAT
npx vercel --prod --yes                       # promote to production
```

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PAT_1` | ✅ | GitHub Personal Access Token (`read:user` + `repo` scopes) |
| `PAT_2` … `PAT_N` | optional | Extra PATs — rotated on rate-limit |
| `PORT` | optional | Dev server port (default `9000`) |
| `NODE_ENV` | optional | Set `development` to disable caching |
| `CACHE_SECONDS` | optional | Override cache TTL (21600–86400 s) |
| `WHITELIST` | optional | Comma-separated allowed usernames |
| `EXCLUDE_REPO` | optional | Comma-separated repos to skip in lang stats |
