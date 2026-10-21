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
        check('goalType', ['books', 'pages'].includes(b.goaltype), 'must be "books" or "pages"');
        check('goalAmount', typeof b.goalAmount === 'number' && b.goalAmount > 0, 'must be a number greater than 0');
        check('startDate', !Number.isNaN(Date.parse(b.startDate)), 'must be a valid date');
        check('endDate', !Number.isNaN(Date.parse(b.endDate)), 'must be a valid date');

        if (problems.length > 0) {
            throw new HttpError(400, 'Validation failed', problems);
        }
        next();
    };
}