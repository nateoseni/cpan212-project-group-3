# M1: Proposal and API Design

# Group 3
# App: PageTurner (reading pace tracker and challenge)

## 1. Problem and users

The app page turner is for people who require time management and want to challenge themselves with how fast they read, and how many books/pages they read. This app will allow users to track how many books they need to read to reach a goal, and the pace that they are going or will need to go to reach their goals. Currently other library/reading apps lack an aspect where users can challenge themselves while keeping track of their reading goals.

The app works by having a user set a goal, like read 20 books or a set amount of pages within a year. It will then create a reading list with books from the database. The user will then have options for "want to read", "in progress" and "finished" regarding the reading list. The app will calculate if the user is behind, ahead, or on pace to reach their goal and the time/date that it will be finished.

## 2. Features

MVP list:
    1. A user can register and sign in to get their own account
    2. A signed-in user can create a yearly reading challenge with a goal of books or pages
    3. A signed-in user can search for a book and add it to a challenge's reading list
    4. A signed-in user can update a reading entry's status, pages read, rating, and notes
    5. A signed-in user can edit or delete their challenges and reading entries
    6. A signed-in user can view a stats page showing pace, projected finish date, and pages per day needed

## 3. External API

API: Open Library

Link: https://openlibrary.org/dev/docs/api/search

Key Required?: No, Open Library is public and free

Rate Limits/Terms: Open Library requests that we 
    -Identify our application with a User-agent header and email
    -Cache responses whenever possible
    -Make useful and time sensitive requests on behalf of human users
They suggest that we do NOT
    -Scrape HTML pages (use API endpoints instead) or harvest HTML in bulk
    -Distribute requests across multiple IPs (like making hundereds of single-book requests)
    -Use open Library as a backend for high-traffic commercial services
For rate limits, Open Library asks that our application adds a header that specifies User-Agent string with the name of the application and contact email or phone number for notice with high volume requests. 
For default, non-identified requests:
    -1 request per second
For identified requests (with User-Agent and email):
    -3 requests per second
Our plan: send a `User-Agent` with the app name and a contact email, and save book snapshots in MongoDB so we do not re-fetch.

Features that use it: 
    -Feature #3 in MVP list, express server calls the API, trims the response, and returns only the fields we use

Response, with fields that we will use:
```json
{
  "numFound": 461,
  "docs": [
    {
      "author_name": [
        "J.R.R. Tolkien"
      ],
      "cover_i": 14627509,
      "first_publish_year": 1937,
      "key": "/works/OL27482W",
      "number_of_pages_median": 310,
      "title": "The Hobbit"
    },
    {
      "author_name": [
        "Charles Dixon",
        "Sean Deming",
        "J.R.R. Tolkien"
      ],
      "cover_i": 8406766,
      "first_publish_year": 1990,
      "key": "/works/OL219602W",
      "number_of_pages_median": 144,
      "title": "The Hobbit"
    }
  ]
}
```


## 4. Data Model Draft

We are going to use User, ReadingGoal, and ReadingEntry

User:
| Field | Type | Required |
| `name` | String | Yes |
| `email` | String (unique) | Yes |
| `passwordHash` | String | Yes |
| `createdAt` | Date | Yes (auto) |

ReadingGoal:

| Field | Type | Required |
| `user` | ObjectId (ref User) | Yes |
| `title` | String | Yes |
| `year` | Number | Yes |
| `goalType` | String: `"books"` or `"pages"` | Yes |
| `goalAmount` | Number (> 0) | Yes |
| `startDate` | Date | Yes |
| `endDate` | Date | Yes |
| `createdAt` | Date | Yes (auto) |

ReadingEntry:

| Field | Type | Required |
| `user` | ObjectId (ref User) | Yes |
| `challenge` | ObjectId (ref Challenge) | Yes |
| `externalKey` | String (Open Library work key) | No |
| `title` | String | Yes |
| `author` | String | Yes |
| `pages` | Number | Yes |
| `coverId` | Number | No |
| `status` | String: `"to-read"`, `"in-progress"`, `"finished"` | Yes (default `"to-read"`) |
| `pagesRead` | Number | Yes (default 0) |
| `startDate` | Date | No |
| `finishDate` | Date | No |
| `rating` | Number (1 to 5) | No |
| `notes` | String | No |

Relationships:
    - A user owns many ReadingGoals.
    - A ReadingGoal belongs to one user and has many reading entries.
    - A reading entry belongs to one ReadingGoal (and so to one user).
    - Book data from the external API is copied into the reading entry when it is added, so the app still works if the API is down.

## 5.  Endpoint list

All endpoints except register and login require a signed-in user. Users only see and change their own data.

| Method | Path | Description | Success | Errors |
|---|---|---|---|---|
| POST | `/api/auth/register` | Create an account | 201 | 400 (invalid input), 409 (email taken) |
| POST | `/api/auth/login` | Sign in | 200 | 400, 401 (wrong credentials) |
| GET | `/api/goals` | List the user's goals | 200 | 401 |
| GET | `/api/goals/:id` | Get one goal | 200 | 401, 403, 404 |
| POST | `POST /api/goals` | Create a goal | 201 | 400, 401 |
| PUT | `PUT /api/goals/:id` | Update a goal | 200 | 400, 401, 403, 404 |
| DELETE | `/DELETE /api/goals/:id` | Delete a goal and its entries | 204 | 401, 403, 404 |
| GET | `/api/entries?goals=<id>` | List entries, optionally filtered by goal or status | 200 | 401 |
| GET | `/api/entries/:id` | Get one entry | 200 | 401, 403, 404 |
| POST | `/api/entries` | Add a book to a goal | 201 | 400, 401, 404 (goal not found) |
| PUT | `/api/entries/:id` | Update status, pages read, rating, notes | 200 | 400, 401, 403, 404 |
| DELETE | `/api/entries/:id` | Remove an entry | 204 | 401, 403, 404 |
| GET | `/api/books/search?q=<text>` | **External API:** search Open Library and return trimmed results | 200 | 400 (missing `q`), 401, 502 (Open Library failed), 429 (rate limited) |
| GET | `GET /api/goals/:id/stats` | Compute pace, projection, and daily target | 200 | 401, 403, 404 |

## 6. Wireframes

TBD

## 7. Team roles

TBD, so far just me (Nathaniel Oseni)




