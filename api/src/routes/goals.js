import { Router } from 'express';
import {
  listGoals, getGoal, createGoal, updateGoal, deleteGoal,
} from '../controllers/goalsController.js';

const router = Router();

//run these functions when a request arrives
router.get('/', listGoals);
router.get('/:id', getGoal);
//Mongoose schema validation now runs in the create/update, dont need previous validate
router.post('/', createGoal);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);

export default router;