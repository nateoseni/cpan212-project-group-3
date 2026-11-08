'use client'; //client component because it uses useState and useEffect

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from '../../../NotificationContext';


export default function EditGoalPage({ params }) {
  //unwrap params using use() because params is a promise in server components
  const resolvedParams = use(params);
  const id = resolvedParams.id; //extract the goal ID from the params


  const router = useRouter();
  const { notify } = useNotification(); //get the notify function from the notification context

  //state management for the goal data, loading state, request submission and validation errors
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({}); //stores field errors from the server
  const [message, setMessage] = useState(''); //general error message

  //load existing goal data from the API when the component mounts
  useEffect(() => {
    async function loadGoal() {
      try {
        //params must be awaited if accessed asynchronously because they are a promise in server components
        const resolvedParams = await params; //resolve the promise to get the actual params
        const res = await fetch(`/api/goals/${resolvedParams.id}`);

        if (res.ok) {
          const data = await res.json();
          setGoal(data); //populate state with the fetched goal data
        } else {
          setMessage('Failed to load goal details');
        }
      } catch (err) {
        setMessage('An error occurred while loading the goal');
      } finally {
        setLoading(false); //stop loading indicator
      }
    }
    if(id) {
      loadGoal(); //only load if id is available
    }
  }, [id]); //pass id into useEffect array ensures this runs only once when the component mounts

  //handle form submission
  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true); //disable the submit button and show "Saving..."
    setErrors({});
    setMessage('');

    //read form inputs using the HTML form's name attributes
    const formData = new FormData(event.target);
    const body = {
      title: formData.get('title'),
      year: Number(formData.get('year')),
      goalType: formData.get('goalType'),
      goalAmount: Number(formData.get('goalAmount')),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
    };

    try {
      const resolvedParams = await params; //resolve the promise to get the actual params
      const response = await fetch(`/api/goals/${resolvedParams.id}`, {
        method: 'PUT', //use PUT for updating existing resources
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      //handle validation errors returned from the API (400 status)
      if (!response.ok) {
        if (response.status === 400 && data.error?.details) {
          const fieldErrors = {};
          for (const d of data.error.details) {
            fieldErrors[d.field] = d.message;
          }
          setErrors(fieldErrors); //display validaton errors next to fields
        } else {
          setMessage(data.error?.message || 'Something went wrong while saving the goal');
        }
        setSubmitting(false); //re-enable the submit button
        return; //stop further processing
      }

      //on successful update, redirect to the goal detail page
      notify('Goal updated'); //show a success notification
      router.push(`/goals/${resolvedParams.id}`);
      router.refresh(); //refresh the page to show updated data
    } catch (err) {
      setMessage('Failed to connect to the server');
      setSubmitting(false); //re-enable the submit button
    }
  }

    //render loading state while fetching initial goal data
    if (loading) return <p>Loading edit form...</p>;
    //render error message if loading failed
    if (!goal) return <p>{message || 'Goal not found'}</p>;

    return (
      <div>
        <h2>Edit Goal</h2>
         
         {/* display general error message if present */}
        {message && <p className="error">{message}</p>}

        {/* form for editing the goal, pre-filled with existing data */}
        <form onSubmit={handleSubmit}>
          <p>
            <label>
              Title <input name="title" defaultValue={goal.title} />
            </label>
            {errors.title && <span className="error">{errors.title}</span>}
          </p>

          <p>
            <label>
              Year <input name="year" type="number" defaultValue={goal.year} required />
            </label>
            {errors.year && <span className="error">{errors.year}</span>}
          </p>

          <p>
            <label>
              Goal Type
              <select name="goalType" defaultValue={goal.goalType}>
                <option value="books">books</option>
                <option value="pages">pages</option>
              </select>
            </label>
            {errors.goalType && <span className="error">{errors.goalType}</span>}
          </p>

          <p>
            <label>
              Goal Amount <input name="goalAmount" type="number" defaultValue={goal.goalAmount} required />
            </label>
            {errors.goalAmount && <span className="error">{errors.goalAmount}</span>}
          </p>

          <p>
            <label>
              Start Date <input name="startDate" type="date" defaultValue={goal.startDate} required />
            </label>
            {errors.startDate && <span className="error">{errors.startDate}</span>}
          </p>

          <p>
            <label>
              End Date <input name="endDate" type="date" defaultValue={goal.endDate} required />
            </label>
            {errors.endDate && <span className="error">{errors.endDate}</span>}
          </p>

          {/* submit button is disabled when the form is being submitted for no duplicate requests */}
          <button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    );
}