import crypto from 'node:crypto';

//this is a stand-in for goals and entries before I use a database

export const goals = [
  {
    id: crypto.randomUUID(),
    title: '2026 Reading Goal',
    year: 2026,
    goalType: 'books',
    goalAmount: 20,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
  },
  {
    id: crypto.randomUUID(),
    title: 'Summer Pages',
    year: 2026,
    goalType: 'pages',
    goalAmount: 3000,
    startDate: '2026-06-01',
    endDate: '2026-08-31',
  },
];

export const entries = [];