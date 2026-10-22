import { HttpError } from '../middleware/errors.js';

//GET /api/books/search
export async function searchBooks(req, res) {
  const q = req.query.q; //for the q part of the url
  if (!q || q.trim() === '') {
    throw new HttpError(400, 'Validation failed', [
      { field: 'q', message: 'is required' },
    ]);
  }

  const url = new URL('https://openlibrary.org/search.json');
  url.searchParams.set('q', q);
  url.searchParams.set('limit', '10');
  url.searchParams.set('fields', 'key,title,author_name,first_publish_year,number_of_pages_median,cover_i');

  const response = await fetch(url); //request from server
  const body = await response.json();

  res.status(200).json(body);
}