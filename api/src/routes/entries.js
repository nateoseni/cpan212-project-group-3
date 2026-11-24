import { Router } from 'express';
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
//Mongoose schema validation now runs in the create/update, dont need previous validate
router.post('/', createEntry);
router.put('/:id', updateEntry);
router.delete('/:id', deleteEntry);

export default router;
