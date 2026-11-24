import Goal from '../models/Goal.js';
import Entry from '../models/Entry.js';
import { HttpError } from '../middleware/errors.js';
import { requireValidId } from '../utils/ids.js';

const FIELDS = ['title', 'year', 'goalType', 'goalAmount', 'startDate', 'endDate'];

//copy only the allowed fields that were actually sent
function pick(body) {
    const out = {};
    for (const key of FIELDS) {
        if (body[key] !== undefined) out[key] = body[key];
    }
    return out;
}


//GET /api/goals/
//convert goals array to json
export async function listGoals(req, res) {
    const goals = await Goal.find().sort({ createdAt: 1 }); //all goals with oldest first
    res.status(200).json(goals);
}

//GET /api/goals/:id
//find by id, returns a goal or throws 404
export async function getGoal(req, res) {
    requireValidId(req.params.id, 'Goal');
    const goal = await Goal.findById(req.params.id);
    if (!goal) throw new HttpError(404, `Goal not found: ${req.params.id}`);
    res.status(200).json(goal);
}

//POST /api/goals
//builds document, runs schema validation and saves it
export async function createGoal(req, res) {
    //req.body is the json sent by the client
    const goal = await Goal.create(pick(req.body));
    res.status(201).json(goal);
}

//PUT /api/goals/:id
export async function updateGoal(req, res) {
    const goal = await Goal.findByIdAndUpdate(req.params.id, pick(req.body), {
        returnDocument: 'after', //return the updated document
        runValidators: true, //apply the schema rules to the update
    });
    if (!goal) throw new HttpError(404, `Goal not found: ${req.params.id}`);
    res.status(200).json(goal)
}

//DELETE /api/goals/:id
export async function deleteGoal(req, res) {
    requireValidId(req.params.id, 'Goal');
    const goal = await Goal.findByIdAndDelete(req.params.id);
    if (!goal) throw new HttpError(404, `Goal not found: ${req.params.id}`);
    await Entry.deleteMany({ goal: goal._id}); //remove its entries too
    res.status(204).send(); //204 means success, no content and sends with an empty body
}