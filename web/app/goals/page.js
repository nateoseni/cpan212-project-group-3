import Link from 'next/link';

//server component
export default async function GoalsPage() {

  const res = await fetch(`${process.env.API_URL}/api/goals`, {
    cache: 'no-store',
  });
  if(!res.ok) throw new Error('Failed to fetch goals');
  const goals = await res.json();

  if (goals.length === 0) {
    return <p>No goals found, create one</p>;
  }
  
  return (
    <div>
      <h2>My Goals</h2>
      <ul>
        {goals.map((goal) => (
          <li key={goal.id}>
            <Link href={`/goals/${goal.id}`}>{goal.title}</Link>
            {' '}({goal.goalAmount} {goal.goalType})
          </li>
        ))}
      </ul>
    </div>
  ); 
}