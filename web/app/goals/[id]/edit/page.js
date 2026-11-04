export default async function EditGoalPage({ params }) {
  const { id } = await params;
  return <h2>Edit goal {id}</h2>;
}