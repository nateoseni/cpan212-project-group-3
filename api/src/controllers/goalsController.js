import crypto from 'node:crypto';
import { goals, entries } from '../data/store.js';
import { HttpError } from '../middleware/errors.js';

//helper function to look goal up by id
function findGoal(id) {
    //traverse array and return the first goal that matches id
    const goal = goals.find((g) => g.id == id);
    if (!goal) throw new HttpError(404, `Goal not found: ${id}`);
    return goal;
}

//GET /api/goals/
//convert goals array to json
export function listGoals(req, res) {
    res.status(200).json(goals);
}

//GET /api/goals/:id
//find by id, returns a goal or throws 404
export function getGoal(req, res) {
    res.status(200).json(findGoal(req.params.id));
}

//POST /api/goals
export function createGoal(req, res) {
    //req.body is the json sent by the client
    const { title, year, goalType, goalAmount, startDate, endDate } = req.body; //take properties from req.body into variables
    //build an object with random id and previous fields
    const goal = {
        id: crypto.randomUUID(),
        title, year, goalType, goalAmount, startDate, endDate,
    };
    goals.push(goal); //push the goal to array
    res.status(201).json(goal);
}

//PUT /api/goals/:id
export function updateGoal(req, res) {
    const goal = findGoal(req.params.id);
    const { title, year, goalType, goalAmount, startDate, endDate } = req.body;
    const changes = { title, year, goalType, goalAmount, startDate, endDate } //collects the fields from req.body
    for (const [key, value] of Object.entries(changes)) { //Object.entries(changes) turns the object into a list of [key, value] pairs
        if (value !== undefined) goal[key] = value; //if value is not undefined, write new value into real goal object
    }
    res.status(200).json(goal)
}

//DELETE /api/goals/:id
export function deleteGoal(req, res) {
    const goal = findGoal(req.params.id);
    goals.splice(goals.indexOf(goal), 1); //find goal position in array, and remove 1 item at that position

    //remove every entry belonging to the deleted goal by counting backwards
    for (let i = entries.length - 1; i >= 0; i--) {
        if (entries[i].goal === goal.id) entries.splice(i, 1);
    }
    res.status(204).send(); //204 means success, no content and sends with an empty body
}