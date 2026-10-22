
import express from 'express';
import goalsRouter from './routes/goals.js';
import booksRouter from './routes/books.js';
import { notFound, errorHandler } from './middleware/errors.js';


const app = express();
app.use(express.json());   //lets express read JSON request bodies

//routes
app.use('/api/goals', goalsRouter);
app.use('/api/books', booksRouter);

app.use(notFound);
app.use(errorHandler);

export default app;