import mongoose from 'mongoose';
import { jsonOptions } from './Goal.js';

const entrySchema = new mongoose.Schema(
    {
        //ref links this entry to a 'Goal', which tells mongoose which model that id belongs to, which is what populate() follows
        goal: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Goal',
            required: [true, 'is required'],
        },
        externalKey: {type: String, trim: true}, //Open Library work key
        title: {
            type: String,
            required: [true, 'is required'],
            trim: true,
            maxlength: [200, 'must be 200 or fewer characters'],
        },
        author: {
            type: String,
            required: [true, 'is required'],
            trim: true,
            maxlength: [200, 'must be 200 or fewer characters'],
        },
        pages: {
            type: Number,
            required: [true, 'is required'],
            min: [1, 'must be at least 1'],
        },
        coverId: { type: Number},
        status: {
            type: String,
            enum: {
                values: ['to-read', 'in-progress', 'finished'],
                message: 'must be "to-read", "in-progress", or "finished"',
            },
            default: 'to-read',
        },
        pagesRead: { type: Number, default: 0, min: [0, 'must be 0 or more'] },
        startDate: { type: String },
        finishDate: { type: String },
        rating: {
            type: Number,
            min: [1, 'must be between 1 and 5'],
            max: [5, 'must be between 1 and 5'],
        },
        notes: { type: String, maxlength: [1000, 'must be 1000 or fewer characters'] },
    },
    { timestamps: true, toJSON: jsonOptions }
);

export default mongoose.model('Entry', entrySchema);