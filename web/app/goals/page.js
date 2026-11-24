import Link from 'next/link';

//query params this page understands, anything else in the URL is ignored
const PARAM_NAMES = ['q', 'goalType', 'year', 'sort', 'limit', 'page'];

function first(value) {
  return Array.isArray(value) ? value[0] : value;
}

function buildHref(params, changes) {
  const merged = { ...params, ...changes };
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value !== undefined && value !== '') qs.set(key, String(value));
  }
  const text = qs.toString();
  return text ? `/goals?${text}` : '/goals';
}

//server component
export default async function GoalsPage({ searchParams }) {
  const raw = await searchParams;

  //keep only the known params as plain strings
  const params = {};
  for (const name of PARAM_NAMES) {
    const value = first(raw[name]);
    if (value) params[name] = value;
  }

  //forward them to express api, and cache: 'no-store' so list is never stale
  const qs= new URLSearchParams(params).toString();
  const res = await fetch(`${process.env.API_URL}/api/goals${qs ? `?${qs}` : ''}`, { cache: 'no-store' });

  let problems = null;
  let data = { items: [], total: 0, page: 1, pages: 0 };
  if (res.status === 400) {
    const body = await res.json();
    problems = body.error.details ?? [{ message: body.error.message }];
  } else if (res.ok) {
    data = await res.json();
  } else {
    throw new Error(`Could not load goals (status ${res.status})`);
  }

  const { items, total, page, pages } = data;

  return (
    <main>
      <h1>Goals</h1>

      <form method="get" action="/goals">
        <input name="q" placeholder="Search title" defaultValue={params.q ?? ''} />

        <select name="goalType" defaultValue={params.goalType ?? ''}>
          <option value="">All types</option>
          <option value="books">Books</option>
          <option value="pages">Pages</option>
        </select>

        <input name="year" type="number" placeholder="Year" defaultValue={params.year ?? ''} />

        <select name="sort" defaultValue={params.sort ?? ''}>
          <option value="">Oldest first</option>
          <option value="-createdAt">Newest first</option>
          <option value="title">Title A-Z</option>
          <option value="-title">Title Z-A</option>
          <option value="year">Year (low to high)</option>
          <option value="-year">Year (high to low)</option>
          <option value="goalAmount">Target (low to high)</option>
          <option value="-goalAmount">Target (high to low)</option>
        </select>

        <select name="limit" defaultValue={params.limit ?? '10'}>
          <option value="5">5 per page</option>
          <option value="10">10 per page</option>
          <option value="25">25 per page</option>
        </select>

        <button type="submit">Apply</button>
        <Link href="/goals">Clear</Link>
      </form>

      {problems && (
        <ul>
          {problems.map((p, i) => (
            <li key={i}>{p.field ? `${p.field}: ` : ''}{p.message}</li>
          ))}
        </ul>
      )}

      {!problems && total === 0 && <p>No goals match, try clearing the filters</p>}

      {/* page past the end, like ?page=99, where items is empty but total isnt*/}
      {!problems && total > 0 && items.length === 0 && (
        <p>That page does not exist <Link href={buildHref(params, { page: 1 })}>Go to page 1</Link></p>
      )}

      <ul>
        {items.map((goal) =>(
          <li key={goal.id}>
            <Link href={`/goals/${goal.id}`}>{goal.title}</Link> ({goal.year}, {goal.goalAmount} {goal.goalType})
          </li>
        ))}
      </ul>

      {pages > 0 && (
        <nav>
          {page > 1 && <Link href={buildHref(params, { page: page = 1 })}>← Previous</Link>}
          <span> Page {page} of {pages} ({total} goals) </span>
          {page < pages && <Link href={buildHref(params, { page: page + 1 })}>Next →</Link>}
        </nav>
      )}
    </main>
  );
}
