import mongoose from 'mongoose';
import Goal from '../models/Goal.js';
import Entry from '../models/Entry.js';
import { HttpError } from '../middleware/errors.js';
import { requireValidId } from '../utils/ids.js';

const FIELDS = [
  'goal', 'externalKey', 'title', 'author', 'pages', 'coverId',
  'status', 'pagesRead', 'startDate', 'finishDate', 'rating', 'notes',
];

//copy only the allowed fields that were sent
function pick(body) {
  const out = {};
  for (const key of FIELDS) {
    if (body[key] !== undefined) out[key] = body[key];
  }
  return out;
}

//pagesRead can never be more than the book's page count, helper function to check
function checkPages(pages, pagesRead) {
  if (pagesRead > pages) {
    throw new HttpError(400, 'Validation failed', [
      { field: 'pagesRead', message: 'cannot be more than pages' },
    ]);
  }
}

//GET /api/entries
export async function listEntries(req, res) {
  const { goal, status } = req.query; //part of the url after the ?
  const filter = {}; //Mongo query built from the filters sent

  //filter only applies if it was sent
  if (typeof goal === 'string') {
    //goal id not in right format cant match anything
    if(!mongoose.isValidObjectId(goal)) return res.status(200).json([]);
    filter.goal = goal;
  }
  if (typeof status === 'string') filter.status = status;

  //populate swaps each entry's goal id for a fiew fields of the goal itself
  const entries = await Entry.find(filter)
    .populate('goal', 'title goalType year')
    .sort({ createdAt: 1});
  res.status(200).json(entries);
}

//GET /api/entries/:id
export async function getEntry(req, res) {
  requireValidId(req.params.id, 'Entry');
  const entry = await Entry.findById(req.params.id).populate('goal', 'title goalType year');
  if (!entry) throw new HttpError(404, `Entry not found: ${req.params.id}`);
  res.status(200).json(entry);
}

//POST /api/entries
export async function createEntry(req, res) {
  const data = pick(req.body)

  requireValidId(data.goal, 'Goal');
  if (!(await Goal.exists({ _id: data.goal }))) {
    throw new HttpError(404, `Goal not found: ${req.body.goal}`);
  }
  checkPages(data.pages, data.pagesRead ?? 0); //with ?? 0: pagesRead defaults to 0 when missing

  const entry = await Entry.create(data); //run schema validation then saves
  res.status(201).json(entry);
}

//PUT /api/entries/:id
export async function updateEntry(req, res) {
  requireValidId(req.params.id, 'Entry');
  
  //load current entry first, so pages check can use its current values when the request only sends of of two fields
  const existing = await Entry.findById(req.params.id);
  if (!existing) throw new HttpError(404, `Entry not found: ${req.params.id}`);

  const changes = pick(req.body);
  delete changes.goal; //an entry cannot move to another goal

  checkPages(changes.pages ?? existing.pages, changes.pagesRead ?? existing.pagesRead);

  const entry = await Entry.findByIdAndUpdate(req.params.id, changes, {
    returnDocument: 'after',
    runValidators: true,
  });
  res.status(200).json(entry);
}

//DELETE /api/entries/:id
export async function deleteEntry(req, res) {
  requireValidId(req.params.id, 'Entry');
  const entry = await Entry.findByIdAndDelete(req.params.id);
  if (!entry) throw new HttpError(404, `Entry not found: ${req.params.id}`);
  res.status(204).send();
}
