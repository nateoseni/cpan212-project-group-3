
import express from 'express';
import { notFound, errorHandler } from './middleware/errors.js';

const app = express();
app.use(express.json());   //lets express read JSON request bodies

//routes
app.use(notFound);
app.use(errorHandler);

export default app;