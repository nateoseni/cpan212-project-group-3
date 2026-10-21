
import express from 'express';

const app = express();
app.use(express.json());   //lets express read JSON request bodies

export default app;