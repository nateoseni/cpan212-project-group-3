'use client';

export default function Error({ error, reset }) {
    return (
        <div className="error-container">
            <h2>Something went wrong</h2>
            <p>Could not connect to the server or load data.</p>
            {error?.message && <p className="error-detail">Details: {error.message}</p>}
            <button onClick={() => reset()}>Try again</button>
        </div>
    );
}