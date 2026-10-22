## Testing

```bash
# list goals (200 expected)
curl -i http://localhost:4000/api/goals

# get one goal (200 expected)
curl -i http://localhost:4000/api/goals/2452a36c-ab41-4808-8fbc-d6994c16d47b

# create a goal (201 expected)
curl -i -X POST http://localhost:4000/api/goals \
  -H "Content-Type: application/json" \
  -d '{"title":"Fall Reading","year":2026,"goalType":"books","goalAmount":5,"startDate":"2026-10-20","endDate":"2026-12-25"}'

# update a goal (200 expected)
curl -i -X PUT http://localhost:4000/api/goals/2452a36c-ab41-4808-8fbc-d6994c16d47b \
  -H "Content-Type: application/json" \
  -d '{"goalAmount":20}'

# delete a goal (204 expected)
curl -i -X DELETE http://localhost:4000/api/goals/2452a36c-ab41-4808-8fbc-d6994c16d47b

# fails validation (400 expected)
curl -i -X POST http://localhost:4000/api/goals \
  -H "Content-Type: application/json" \
  -d '{"title":"","goalType":"movies"}'

# goal doesn't exist (404 expected)
curl -i http://localhost:4000/api/goals/does-not-exist

# search books (200 expected, run twice to see the cache hit in the server terminal)
curl -i "http://localhost:4000/api/books/search?q=the+hobbit"
```

