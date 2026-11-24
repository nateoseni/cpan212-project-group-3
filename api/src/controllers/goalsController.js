import mongoose from 'mongoose';
import Goal from '../models/Goal.js';
import Entry from '../models/Entry.js';
import { HttpError } from '../middleware/errors.js';
import { requireValidId } from '../utils/ids.js';

//only these fields sorted on, everything else gets a 400
const SORT_FIELDS = ['title', 'year', 'goalAmount', 'createdAt'];
const GOAL_TYPES = ['books', 'pages'];
const MAX_LIMIT = 50;

//escape regex special characters so user input "a.*" is treated as plain text
function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

//read a positive integer query param, or fall back to a default
//pushes a problem onto `problems` instead of throwing to report all bad params at once
function readInt(value, name, fallback, problems) {
    if (value === undefined) return fallback;
    //?page[x]=1 arrives as an object/array not a string so reject anything that isnt a string
    if (typeof value !== 'string' || !/^\d+$/.test(value) || Number(value) < 1) {
        problems.push({ field: name, message: 'must be a whole number of 1 or more' });
        return fallback;
    }
    return Number(value);
}
//only these fields may come from the request body, anything else (like _id or createdAt) is ignored
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
    const { goalType, year, q, sort } = req.query;
    const problems = []; //collects every bad query param to send together

    const filter = {};

    if (goalType !== undefined) {
        if (!GOAL_TYPES.includes(goalType)) {
            problems.push({ field: 'goalType', message: `must be one of: ${GOAL_TYPES.join(', ')}` });
        } else {
            filter.goalType = goalType;
        }
    }

    if (year !== undefined) {
        const y = readInt(year, 'year', undefined, problems);
        if (y !== undefined) filter.year = y;
    }

    if (q !== undefined) {
        if (typeof q !== 'string') {
            problems.push({ field: 'q', message: 'must be text' });
        } else if (q.length > 100) {
            problems.push({ field: 'q', message: 'must be 100 or fewer characters' })
        } else if (q.trim()) {
            //a RegEXP object passes sanitizeFilter, and the text is escaped first
            filter.title = new RegExp(escapeRegex(q.trim()), 'i');
        }
    }

    //sorting
    let sortSpec = { createdAt: 1 }; //default
    if (sort !== undefined) {
        const field = typeof sort === 'string' ? sort.replace(/^-/, '') : '';
        if (!SORT_FIELDS.includes(field)) {
            problems.push({ field: 'sort', message: `must be one of: ${SORT_FIELDS.join(', ')} (prefix with - for descending)`});
        } else {
            sortSpec = { [field]: sort.startsWith('-') ? -1 : 1};
        }
    }
    sortSpec._id = 1; //tie breaker so pages never repeat or skip items when values are equal

    //pagination
    const page = readInt(req.query.page, 'page', 1, problems);
    let limit = readInt(req.query.limit, 'limit', 10, problems);
    if (limit > MAX_LIMIT) {
        problems.push({ field: 'limit', message: `must be ${MAX_LIMIT} or less` });
    }

    //any bad param -> 400 in standard error shape
    if(problems.length > 0) {
        throw new HttpError(400, 'Invalid query parameters', problems);
    }

    //run page query and the count at same time, both use same filter
    const [items, total] = await Promise.all([
        Goal.find(filter)
            .sort(sortSpec)
            .skip((page - 1) * limit) //skip the items on earlier pages
            .limit(limit),
        Goal.countDocuments(filter),
    ]);

    res.json({
        items, 
        total, //matches across all pages
        page,
        limit,
        pages: Math.ceil(total / limit), //0 when nothing matches
    });
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