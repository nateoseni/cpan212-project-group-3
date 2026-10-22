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

    let body;
    //in case of complications with Open Library, using try and catch
    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(5000) }); //send request, aborts if no answer in 5 seconds with TimeoutError

        if (!response.ok) {
            throw new HttpError(502, `Open Library returned status ${response.status}`); //external API error if response isnt ok
        }   
        body = await response.json(); //wait until call is finished and read response as json
    } catch (err) {
        if (err instanceof HttpError) throw err;
        if (err.name === 'TimeoutError') {
            throw new HttpError(504, 'Open Library took too long to respond'); //timeout error
        }
        throw new HttpError(502, 'Could not get a valid response from Open Library'); //everything else error
    }

  const data = {
  query: q,
  total: body.numFound ?? 0,
  results: (body.docs ?? []).map((doc) => ({
    externalKey: doc.key,
    title: doc.title,
    author: doc.author_name ? doc.author_name.join(', ') : 'Unknown',
    firstPublishYear: doc.first_publish_year ?? null,
    pages: doc.number_of_pages_median ?? null,
    coverId: doc.cover_i ?? null,
  })),
};

  res.status(200).json(data);
}