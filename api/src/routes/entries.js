import { Router } from 'express';
import { validateEntry } from '../middleware/validate.js';
import {
  listEntries,
  getEntry,
  createEntry,
  updateEntry,
  deleteEntry,
} from '../controllers/entriesController.js';

const router = Router();

router.get('/', listEntries);
router.get('/:id', getEntry);
router.post('/', validateEntry(), createEntry);
router.put('/:id', validateEntry(true), updateEntry);
router.delete('/:id', deleteEntry);

export default router;
