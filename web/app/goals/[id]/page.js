export default async function GoalDetailPage({ params }) {
  const { id } = await params;
  return <h2>Goal {id}</h2>;
}