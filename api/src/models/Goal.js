import mongoose from 'mongoose';

//makes JSON output use "id" (a string) and hide "_id" and "__v", so the frontend which reads goal.id, keeps working
export const jsonOptions = {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
    return ret;
  },
};

const dateRule = {
  type: String,
  required: [true, 'is required'],
  match: [/^\d{4}-\d{2}-\d{2}$/, 'must be a date like 2026-01-31'],
};

const goalSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'is required'],
            trim: true,
            minlength: [1, 'is required'],
            maxlength: [100, 'must be 100 or fewer characters'],
        },
        year: {
            type: Number,
            required: [true, 'is required'],
            min: [2000, 'must be 2000 or later'],
            max: [2100, 'must be 2100 or earlier'],
        },
        goalType: {
            type: String,
            required: [true, 'is required'],
            enum: { values: ['books', 'pages'], message: 'must be "books" or "pages"' },
        },
        goalAmount: {
            type: Number,
            required: [true, 'is required'],
            min: [1, 'must be at least 1'],
        },
        startDate: dateRule,
        endDate: dateRule,
    },
    { timestamps: true, toJSON: jsonOptions }
);

export default mongoose.model('Goal', goalSchema);