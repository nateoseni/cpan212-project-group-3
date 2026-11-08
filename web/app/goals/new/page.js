'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNotification } from '../NotificationContext'; // new/page.js


export default function NewGoalPage() {
  const router = useRouter();
  const { notify } = useNotification();

  //state is the value the page remembers, one changes and react re-renders the page
  const [submitting, setSubmitting] = useState(false); //true when the form is being submitted
  const [errors, setErrors] = useState({}); //field errors from the server
  const [message, setMessage] = useState(''); //general error message

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true); //disables the button and shows "Saving..."
    setErrors({});
    setMessage('');

    //formData reads every input in the form by its name="..." attribute
    const formData = new FormData(event.target);

    //process the form data here
    //for example, you could send it to a server or perform validation
    //validator requires real numbers for year and goalAmount, so convert them to numbers here
    const body = {
      title: formData.get('title'),
      year: Number(formData.get('year')),
      goalType: formData.get('goalType'),
      goalAmount: Number(formData.get('goalAmount')),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
    };

    try {
      //path is relative (/api/goals). The browser sends it to Next and the rewrite in next.config.mjs forwards it to Express
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, //tell express that the body is JSON
        body: JSON.stringify(body), //turn object into JSON string for sending to server
      });

      //when API returns a 400, field errors appear next to the form
      if (res.status === 400) {
        const data = await res.json();
        //api sends back an array of field errors, convert it to an object keyed by field name for easier display in the form
        const fieldErrors = {};
        for (const d of data.error.details ?? []) {
          fieldErrors[d.field] = d.message;
        }
        setErrors(fieldErrors);
        setSubmitting(false); //enable button again
        return; //stop processing, don't redirect to /goals
      }

      //any other error is displayed as a general message
      if (!res.ok) throw new Error('Failed to save the goal');

      notify('Goal created'); //show a success notification

      //after saving land on the detail or list page and see the change
      router.push('/goals'); //redirect to the list page after saving
      router.refresh(); //re-fetch the server data to show the new goal
    } catch (err) {
      setMessage(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2>New Goal</h2>

       {/* onSubmit runs handleSubmit instead of a normal browser submit */}
      <form onSubmit={handleSubmit}>
        <p>
           {/* name="title" is how FormData finds this input above */}
          <label>Title <input name="title" /></label>
           {/* Shows only if the API reported an error for this field.
              The && means if errors.title exists then draw the span */}
          {errors.title && <span className="error">{errors.title}</span>}
        </p>  
        <p>
          {/* defaultValue sets a starting value but lets the user change it */}
          <label>Year <input name="year" type="number" defaultValue={2026} /></label>
          {errors.year && <span className="error">{errors.year}</span>}
        </p>
        <p>
          <label>
            Goal Type
            <select name="goalType" defaultValue="books">
              <option value="books">books</option>
              <option value="pages">pages</option>
            </select>
          </label>
          {errors.goalType && <span className="error">{errors.goalType}</span>}
        </p>
        <p>
          <label>Goal Amount <input name="goalAmount" type="number" /></label>
          {errors.goalAmount && <span className="error">{errors.goalAmount}</span>}
        </p>
        <p>
          <label>Start Date <input name="startDate" type="date" /></label>
          {errors.startDate && <span className="error">{errors.startDate}</span>}
        </p>
        <p>
          <label>End Date <input name="endDate" type="date" /></label>
          {errors.endDate && <span className="error">{errors.endDate}</span>}
        </p>
          {/* the button is disabled while request is sending. disabled={submitting} is true from click until requests is complete. ensures no double submit */}  
          <button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Goal'}
          </button>
          {/* shows a general error message if the API returned an error that wasn't a field error */}
          {message && <p className="error">{message}</p>}
      </form>
    </div>
  );
}