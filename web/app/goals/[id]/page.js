import Link from "next/link";
import { notFound } from "next/navigation";

export default async function GoalDetailPage({ params }) {
  const { id } = await params;

  const res = await fetch(`${process.env.API_URL}/api/goals/${id}`, {
    cache: "no-store",
  });
  if (res.status === 404) notFound();
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
    </div>
  );
}