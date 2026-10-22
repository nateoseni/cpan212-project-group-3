import { Router } from 'express';
import { validateGoal } from '../middleware/validate.js';
import {
  listGoals, getGoal, createGoal, updateGoal, deleteGoal,
} from '../controllers/goalsController.js';

const router = Router();

//run these functions when a request arrives
router.get('/', listGoals);
router.get('/:id', getGoal);
router.post('/', validateGoal(), createGoal); //validate the body first, then create goal
router.put('/:id', validateGoal(true), updateGoal); //validateGoal(true) makes each field optional but still checked if sent
router.delete('/:id', deleteGoal);

export default router;