import { connectDb } from './db.js';
import app from './app.js';

const PORT = process.env.PORT || 4000;

await connectDb();

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});