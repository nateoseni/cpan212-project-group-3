import crypto from 'node:crypto';
import { goals, entries } from '../data/store.js';
import { HttpError } from '../middleware/errors.js';

function findEntry(id) {
  const entry = entries.find((e) => e.id === id);
  if (!entry) throw new HttpError(404, `Entry not found: ${id}`);
  return entry;
}

//pagesRead can never be more than the book's page count, helper function to check
function checkPages(entry) {
  if (entry.pagesRead > entry.pages) {
    throw new HttpError(400, 'Validation failed', [
      { field: 'pagesRead', message: 'cannot be more than pages' },
    ]);
  }
}

//GET /api/entries
export function listEntries(req, res) {
  const { goal, status } = req.query; //part of the url after the ?
  let result = entries; //start with every entry

  //filter only applies if it was sent
  if (typeof goal === 'string') result = result.filter((e) => e.goal === goal); //keep entries where goal equals the goal id from URL
  if (typeof status === 'string') result = result.filter((e) => e.status === status);
  res.status(200).json(result);
}

//GET /api/entries/:id
export function getEntry(req, res) {
  res.status(200).json(findEntry(req.params.id));
}

//POST /api/entries
export function createEntry(req, res) {
  if (!goals.some((g) => g.id === req.body.goal)) {
    throw new HttpError(404, `Goal not found: ${req.body.goal}`);
  }

  const entry = {
    id: crypto.randomUUID(),
    status: 'to-read',
    pagesRead: 0,
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  checkPages(entry);

  entries.push(entry); //save to the in-memory array
  res.status(201).json(entry);
}

//PUT /api/entries/:id
export function updateEntry(req, res) {
  const entry = findEntry(req.params.id);

  //build updated version in a copy, so real entry isnt changed yet if failed check
  const updated = { ...entry, ...req.body };
  checkPages(updated);

  Object.assign(entry, updated); //copy checked values onto the real entry
  res.status(200).json(entry);
}

//DELETE /api/entries/:id
export function deleteEntry(req, res) {
  const entry = findEntry(req.params.id);
  entries.splice(entries.indexOf(entry), 1);
  res.status(204).send();
}
