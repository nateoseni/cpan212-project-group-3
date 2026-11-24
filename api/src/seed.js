import mongoose from 'mongoose';
import { connectDb } from './db.js';
import Goal from './models/Goal.js';
import Entry from './models/Entry.js';

//30 goal titles so paginated list has more than 25
const TITLES = [
    'Spring Reading Sprint', 'Summer Beach Reads', 'Fall Reading', 'Winter Warm-Up',
    'Classics Challenge', 'Sci-Fi Marathon', 'Mystery Month', 'Fantasy Quest',
    'Non-Fiction Focus', 'Biography Binge', 'Poetry Practice', 'Short Story Streak',
    'Graphic Novel Run', 'Book Club Picks', 'Commute Audiobooks', 'Lunch Break Reads',
    'Weekend Reader', 'Night Owl Pages', 'Canadian Authors', 'Around the World',
    'History Deep Dive', 'Science Shelf', 'Self-Improvement Set', 'Thriller Streak',
    'Romance Reads', 'Horror October', 'Young Adult Favourites', 'Re-Read Favourites',
    'Library Haul', 'New Year Reset',
];

//books so i can attach to the first goals as entries
const BOOKS = [
    { title: 'Dune', author: 'Frank Herbert', pages: 412 },
    { title: 'The Hobbit', author: 'J.R.R. Tolkien', pages: 310 },
    { title: 'Project Hail Mary', author: 'Andy Weir', pages: 476 },
    { title: 'Pride and Prejudice', author: 'Jane Austen', pages: 279 },
    { title: 'The Martian', author: 'Andy Weir', pages: 369 },
    { title: 'Gone Girl', author: 'Gillian Flynn', pages: 415 },
    { title: 'Educated', author: 'Tara Westover', pages: 334 },
    { title: 'Circe', author: 'Madeline Miller', pages: 393 },
];
const STATUSES = ['finished', 'in-progress', 'to-read'];

async function seed() {
    await connectDb();

    //delete everything first so running the script twice never doubles data
    await Entry.deleteMany({});
    await Goal.deleteMany({});

    //build and insert the goals, insertMany runs schema validation
    const goalDocs = TITLES.map((title, i) => {
        const year = 2024 + (i % 4); //2024 to 2027 so the year filter has something to do
        return {
            title,
            year,
            goalType: i % 2 === 0 ? 'books' : 'pages', //alternate so the type filter has both (even is books odd is pages)
            goalAmount: i % 2 === 0 ? 5 + (i % 10) : 1000 + i * 100, //books goal gets 5 to 14 books, pages goal gets 1000 or more pages
            startDate: `${year}-01-01`,
            endDate: `${year}-12-31`,
        };
    });
    //save the 30 goals, the goals array holds real docs, each with its database _id
    const goals = await Goal.insertMany(goalDocs);

    //build entries for first 12 goals, 2 each and 'goal' golds the goal's _id which is what makes populate work
    const entryDocs = [];
    goals.slice(0, 12).forEach((goal, g) => {
        for (let k = 0; k < 2; k++) { //runs twice per goal, gives 2 entries per goal
            //modulo BOOKS.length so the entries cycle through books list and the number wraps around (from 0 to 7 in this case)
            const book = BOOKS[(g * 2 + k) % BOOKS.length]; //g * 2 + k gives every entry its own number, 0 through 23 (ex. goal 0 k would give 0 and 1)
            //add g and k, modulo statuses length (which is 3) to wrap g + k onto the statuses
            const status = STATUSES[(g + k) % STATUSES.length];
            const entry = {
                goal: goal._id, //stores goal's id in the entry, populate('goal') turns that id back into the goal's details
                title: book.title,
                author: book.author,
                pages: book.pages,
                status,
                //pagesRead has to stay between 0 and pages
                //if in-progress, take half the book's pages and round down so it doesn't give decimals or go above page count in edge case
                pagesRead: status === 'finished' ? book.pages : status === 'in-progress' ? Math.floor(book.pages / 2) : 0,  
            };
            if (status !== 'to-read') entry.startDate = `${goal.year}-02-01`;
            if(status === 'finished') {
                entry.finishDate = `${goal.year}-03-15`;
                entry.rating = 3 + ((g + k) % 3); //3 to 5
            }
            //push each entry object to entryDocs array
            entryDocs.push(entry);
        }
    });
    //save the 24 entries, insert every object as a new document in the entries array, each now has its own _id
    const entries = await Entry.insertMany(entryDocs);

    console.log(`Seeded ${goals.length} goals and ${entries.length} entries`);
}

//run it and close connection so script doesnt infinitely run, set failing exit code on error
seed().catch((err) => {
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());