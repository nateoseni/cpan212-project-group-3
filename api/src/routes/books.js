import { Router } from 'express';
import { searchBooks } from '../controllers/booksController.js'

const router = Router();
router.get('/search', searchBooks);

export default router;