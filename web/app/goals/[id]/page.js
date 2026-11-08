import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

//separate component for the slower part
async function ExternalBookInfo({ goalTitle }) {
  //simulate or perform a slower fetch to an external API, like OpenLibrary
  const extRes = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(goalTitle)}`);
  const extData = await extRes.json();

  return (
    <div classname="external-info">
      <h3>Open Library Suggestions:</h3>
      <p>Found {extData.numFound || 0} matching books</p>
    </div>
  );
}


export default async function GoalDetailPage({ params }) {
  //fetch data using the dynamic route parameter from the API ex. fetch('/api/goals/abc') for /goals/abc
  const { id } = await params;

  //fetch the main goal data from the API
  const res = await fetch(`${process.env.API_URL}/api/goals/${id}`, {
    cache: "no-store",
  });
  if (res.status === 404) notFound(); //if the API returns a 404, show the not-found page
  if (!res.ok) throw new Error("Failed to fetch goal");
  const goal = await res.json();

  return (
    <div>
      <h2>{goal.title}</h2>
      <p>
        Goal: {goal.goalAmount} {goal.goalType} in {goal.year}
      </p>
      <p>
        {goal.startDate} to {goal.endDate}
      </p>
      <Link href={`/goals/${id}/edit`}>Edit Goal</Link>

      {/* wrap the slower component in Suspense to show a fallback while it loads */}
      <Suspense fallback={<p>Loading external book data...</p>}>
        <ExternalBookInfo goalTitle={goal.title} />
      </Suspense> 
    </div>
  );
}