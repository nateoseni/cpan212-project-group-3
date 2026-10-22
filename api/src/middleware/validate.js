import { HttpError } from './errors.js';

export function validateGoal(partial = false) {
    return(req, res, next) => {
        const b = req.body;
        const problems = [];

        const check = (field, ok, message) => {
            const missing = b[field] === undefined;
            if (missing && !partial) problems.push({field, message: 'is required'});
            else if (!missing && !ok) problems.push({field, message });
        };

        check('title', typeof b.title === 'string' && b.title.trim() !== '', 'must be a non-empty string');
        check('year', Number.isInteger(b.year), 'must be a whole number');
        check('goalType', ['books', 'pages'].includes(b.goalType), 'must be "books" or "pages"');
        check('goalAmount', typeof b.goalAmount === 'number' && b.goalAmount > 0, 'must be a number greater than 0');
        check('startDate', !Number.isNaN(Date.parse(b.startDate)), 'must be a valid date');
        check('endDate', !Number.isNaN(Date.parse(b.endDate)), 'must be a valid date');

        if (problems.length > 0) {
            throw new HttpError(400, 'Validation failed', problems);
        }
        next();
    };
}

export function validateEntry(partial = false) {
    return(req, res, next) => {
        const b = req.body;
        const problems = [];

        const check = (field, ok, message, required = true) => {
            const missing = b[field] === undefined;
            if (missing && required && !partial) problems.push({field, message: 'is required'});
            else if (!missing && !ok) problems.push({field, message });
        };

        check('goal', typeof b.goal === 'string' && b.goal.trim() !== '', 'must be a goal id');
        check('title', typeof b.title === 'string' && b.title.trim() !== '', 'must be a non-empty string');
        check('author', typeof b.author === 'string' && b.author.trim() !== '', 'must be a non-empty string');
        check('pages', Number.isInteger(b.pages) && b.pages > 0, 'must be a whole number greater than 0');

        //optional fields, only checked if sent
        check('status', ['to-read', 'in-progress', 'finished'].includes(b.status), 'must be "to-read", "in-progress", or "finished"', false);
        check('pagesRead', Number.isInteger(b.pagesRead) && b.pagesRead >= 0, 'must be a whole number greater than or equal to 0', false);
        check('rating', Number.isInteger(b.rating) && b.rating >= 1 && b.rating <= 5, 'must be a whole number between 1 and 5', false);

        if (problems.length > 0) {
            throw new HttpError(400, 'Validation failed', problems);
        }
        next();
    };
}