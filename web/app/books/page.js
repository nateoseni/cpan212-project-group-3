'use client';

import { useState } from 'react';

export default function BookSearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null); //null means no results yet
    const [searching, setSearching] = useState(false); //true when the search is in progress
    const [message, setMessage] = useState(''); //general error message

    async function handleSearch(event) {
        event.preventDefault();
        setSearching(true);
        setResults(null);
        setMessage('');

        try {
            //relative path, the rewrite forwards this to Express, which calls Open Library API
            const res = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();

            if (!res.ok) {
                //express sends { error: {message } } for 400, 502, and 504
                setMessage(data.error?.message || 'Search Failed');
            } else {
                setResults(data.results);
            }
        } catch {
            setMessage('Could not reach the server');
        }

        setSearching(false); 
}

return (
    <div>
        <h2>Find books</h2>

        <form onSubmit={handleSearch}>
            <input
            value={query}
            onChange={(error) => setQuery(error.target.value)}
            placeholder="Search by title"
            />
            <button type="sumbit" disabled={searching}>
                {searching ? 'Searching...' : 'Search'}
            </button>
        </form>

        {message && <p className="error">{message}</p>}

        {results && results.length === 0 && <p>No books found</p>}

        {results && results.length > 0 && (
            <ul>
                {results.map((book) => (
                <li key={book.externalKey}>
                    <strong>{book.title}</strong> by {book.author}
                    {book.firstPublishYear && ` (${book.firstPublishYear})`}
                    {book.pages && ` , ${book.pages} pages`}
                </li>
                ))}
            </ul>
        )}
    </div>
    );
}