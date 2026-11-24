# CPAN212 Project Group 3 - Reading Goal Tracker App (PageTurner) using Open Library API

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

| App | File | Variable | Example | Purpose |
| --- | --- | --- | --- | --- |
| api | `api/.env` | `PORT` | `4000` | Port the Express API listens on |
| api | `api/.env` |  `CONTACT_EMAIL` | `user@example.com` | Sent to Open Library in the User-Agent header |
| web | `web/.env.local` | `API_URL` | `http://localhost:4000` | Where Next.js finds the Express API (used by server components and by `/api` rewrite) |

### Pages

| Page | URL |
| --- | --- |
| Goals list | `/goals` |
| Goal detail | `/goals/:id` |
| Create goal | `/goals/new` |
| Edit goal | `/goals/:id/edit` |
| Book search | `/books` |

### How the frontend gets its data

The Next.js app only talks to the Express API. Server components fetch with `process.env.API_URL`. Code in the browser calls `/api/...`, and `next.config.mjs` rewrites those requests to the Express API. Only Express calls the external API (Open Library)

### Shared state

React Context (`NotificationContext`) holds notification messages. The create and edit forms set them and a banner in the root layout shows them

## 3. MongoDB 

### Setup 

1. Create a MongoDB Atlas cluser and a database user, allow your current ip address in network access
2. In 'api/', copy `.env.example` to `.env` and set `MONGODB_URI` to your connection string with the database name at the end 
(`.../pageturner`). For example, MONGODB_URI=mongodb+srv://<username>:<password>@cpan212.fxqfwif.mongodb.net/pageturner
3. Run `npm install` and `npm run dev` in `api/`. the API exits with a message if `MONGODB_URI` is missing

| Variable | Where | Purpose |
| `MONGODB_URI` | `api/.env` | MongoDB Atlas connection string |
| `API_URL` | `web/.env.local` | Where the Next.js app finds the API (`http://localhost:4000`) |

### Seed data

```bash
cd api
npm run seed
```

Deletes every goal and entry, then recreates 30 goals and 24 entries (for the first 12 goals). No API route creates or deletes seed data

### `GET /api/goals` query parameters

| Param | Values | Default | Notes |
|---|---|---|---|
| `goalType` | `books` or `pages` | none | exact-match filter |
| `year` | whole number | none | exact-match filter |
| `q` | text, up to 100 characters | none | case-insensitive title search (input is escaped) |
| `sort` | `title`, `year`, `goalAmount`, `createdAt` | `createdAt` | prefix with `-` for descending |
| `page` | whole number, 1 or more | `1` | |
| `limit` | whole number, 1 to 50 | `10` | maximum is 50 |


Response: `{ "items": [...], "total": 30, "page": 1, "limit": 10, "pages": 3 }`
Invalid values (like `sort=password` or `limit=500`) return `400` with error details

Example: `GET /api/goals?goalType=books&year=2026&sort=-title&page=2&limit=5`

### Related data and errors

- Each entry belongs to a goal (`Entry.goal` references `Goal`). `GET /api/entries/:id` and `GET /api/entries` use `populate` to return the goal's title, type and year
- Mongoose validation errors return `400` as `{ "error": { "message", "details": [{ "field", "message" }] } }`. A badly formed or unknown id returns `404`
- The goals page (`/goals`) keeps its filters, sort and page in the URL, for example: `/goals?goalType=books&sort=-year&page=2`

### AI Use: 

Throughout the project, Claude was used to understand ideas/concepts, helped to provide assistance with structuring, and some troubleshooting such as helping find typos (had a particularly annoying time with a typo in the CastError check)
