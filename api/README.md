## Testing

```bash
# list goals (200 expected): GET /api/goals
curl -i http://localhost:4000/api/goals

# get one goal (200 expected): GET /api/goals/:id
curl -i http://localhost:4000/api/goals/<GOAL_ID>

# create a goal (201 expected): POST /api/goals
curl -i -X POST http://localhost:4000/api/goals \
  -H "Content-Type: application/json" \
  -d '{"title":"Fall Reading","year":2026,"goalType":"books","goalAmount":5,"startDate":"2026-10-20","endDate":"2026-12-25"}'

# update a goal (200 expected): PUT /api/goals/:id
curl -i -X PUT http://localhost:4000/api/goals/<GOAL_ID> \
  -H "Content-Type: application/json" \
  -d '{"goalAmount":20}'

# delete a goal (204 expected): DELETE /api/goals/:id
curl -i -X DELETE http://localhost:4000/api/goals/<GOAL_ID>

# fails validation (400 expected): POST /api/goals
curl -i -X POST http://localhost:4000/api/goals \
  -H "Content-Type: application/json" \
  -d '{"title":"","goalType":"movies"}'

# goal doesn't exist (404 expected): GET /api/goals/does-not-exist
curl -i http://localhost:4000/api/goals/does-not-exist

# search books (200 expected, run twice to see the cache hit in the server terminal): GET /api/books/search?q=the+hobbit
curl -i "http://localhost:4000/api/books/search?q=the+hobbit"
```

```bash
# all entries (200 expected): GET /api/entries
curl -i http://localhost:4000/api/entries

# one goal's entries (200 expected): GET /api/entries?goal=<GOAL_ID>
curl -i "http://localhost:4000/api/entries?goal=<GOAL_ID>"

# goal id with no entries (200 expected, with empty list): GET /api/entries?goal=nothing
curl -i "http://localhost:4000/api/entries?goal=nothing"

# get one entry (200 expected): GET /api/entries/:id
curl -i http://localhost:4000/api/entries/<ENTRY_ID>

# filter by status (200 expected): GET /api/entries?status=finished
curl -i "http://localhost:4000/api/entries?status=finished"

# create an entry (201 expected): POST /api/entries
curl -i -X POST http://localhost:4000/api/entries \
  -H "Content-Type: application/json" \
  -d '{"goal":"<GOAL_ID>","title":"Yes","author":"Mary Sue","pages":474}'

# update an entry (200 expected): PUT /api/entries/:id
curl -i -X PUT http://localhost:4000/api/entries/<ENTRY_ID> \
  -H "Content-Type: application/json" \
  -d '{"status":"in-progress","pagesRead":50}'

# delete an entry (204 expected): DELETE /api/entries/:id
curl -i -X DELETE http://localhost:4000/api/entries/<ENTRY_ID>

# invalid body fails validation (400 expected): POST /api/entries (with a bad body)
curl -i -X POST http://localhost:4000/api/entries \
  -H "Content-Type: application/json" \
  -d '{"goal":"abc","title":"","author":"Gary Stu","pages":-5,"status":"done","rating":9}'

# pagesRead more than pages (400 expected): PUT /api/entries/:id
curl -i -X PUT http://localhost:4000/api/entries/<ENTRY_ID> \
  -H "Content-Type: application/json" \
  -d '{"pagesRead":9999}'

# entry that doesn't exist (404 expected): GET /api/entries/does-not-exist
curl -i http://localhost:4000/api/entries/does-not-exist

# goal that doesn't exist (404 expected): POST /api/entries (with a fake goal)
curl -i -X POST http://localhost:4000/api/entries \
  -H "Content-Type: application/json" \
  -d '{"goal":"real-goal","title":"Yes","author":"Mary Sue","pages":474}'
```