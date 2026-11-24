import mongoose from 'mongoose';
import { HttpError } from '../middleware/errors.js';

export function requireValidId(id, label) {
    if (!mongoose.isObjectIdOrHexString(id)) {
        throw new HttpError(404, `${label} not found: ${id}`);
    }
}