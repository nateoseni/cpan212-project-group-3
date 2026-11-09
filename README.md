## AI Use: 

 For M1, claude was used to help build the sturcture and make a plan for efficiently conducting the assignment. 
 For M2, claude was also used to help explain error handling, routing, and where errors were being made in the code
 For M3, claude helped explain the processes for rewrites, helped with errors, and provided examples for them

## Running the project

PageTurner has two apps, and both must be running at the same time in two terminals

### 1. API (Express, port 4000)

```bash
cd api
npm install
cp .env.example .env
npm run dev
```

### 2. Web (Next.js, port 3000)

```bash
cd web
npm install
cp .env.example .env.local
npm run dev
```

Then open http://localhost:3000. The web app will show an error if the API isn't running.

### Environment variables

/ App / File / Variable / Example / Purpose /
/ api / `api/.env` / `PORT` | `4000` / Port the Express API listens on /
/ api / `api/.env` /  `CONTACT_EMAIL` / `user@example.com` / Sent to Open Library in the User-Agent header /
/ web / `web/.env.local` / `API_URL` / `http://localhost:4000` / Where Next.js finds the Express API (used by server components and by `/api` rewrite) /

## Pages

/ Page / URL /
/ Goals list / `/goals` /
/ Goal detail / `/goals/:id` /
/ Create goal / `/goals/new` /
/ Edit goal / `/goals/:id/edit` /
/ Book search / `/books` /

## How the frontend gets its data

The Next.js app only talks to the Express API. Server components fetch with `process.env.API_URL`. Code in the browser calls `/api/...`, and `next.config.mjs` rewrites those requests to the Express API. Only Express calls the external API (Open Library)

## Shared state

React Context (`NotificationContext`) holds notification messages. The create and edit forms set them and a banner in the root layout shows them
