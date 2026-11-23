import mongoose from 'mongoose';
//treats filter objects from user input as plain values, not query operators
mongoose.set('sanitizeFilter', true);

export async function connectDb() {
    const uri = process.env.MONGODB_URI;

    //stop with message if connection string is missing
    if (!uri) {
        console.error('MONGODB_URI is missing. Copy api/.env.example to api/.env and out your connection string in it');
        process.exit(1);
    }

    try {
        //give up after 10 seconds instead of default 30
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    } catch (error) {
        console.error('Could not connect to MongoDB: ' + error.message);
        process.exit(1);
    }

    console.log('Connected to MongoDB, database "' + mongoose.connection.name + '"');
}