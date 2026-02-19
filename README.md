# JSON URL Checker

A small web tool to check a JSON file by URL for **syntax errors** and **duplicate entries**. Data is fetched in your browser and never stored.

## Features

- **One input**: paste a JSON URL (e.g. raw GitHub, or any CORS-enabled endpoint).
- **Check for errors**: runs `JSON.parse` and shows the exact error message, position, and context if invalid.
- **Check for duplicates**: assumes a JSON array; finds duplicate entries by `id` (or by full object if no `id`).
- No server storage: the file is only in memory during the check, then discarded.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

1. Push this folder to a GitHub repo (e.g. a new repo or your existing one).
2. In [Vercel](https://vercel.com), import the repo.
3. Set the **Root Directory** to `json-checker` if the app lives in a subfolder.
4. Deploy.

## Tech

- Next.js 14 (App Router)
- React 18
- No backend: fetch and analysis run in the browser.
