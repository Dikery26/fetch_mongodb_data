const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// MongoDB setup
const mongoUrl = process.env.MONGODB_URL;
const dbName = process.env.MONGODB_DATABASE;
let db;

app.use(cors({
    origin: 'https://automate-emails-test.webflow.io'
  }));

// Function to connect to MongoDB
async function connectToMongoDB() {
  try {
    const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    db = client.db(dbName);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

// Endpoint to fetch data from a specific collection
app.get('/getContents', async (req, res) => {
  try {
    const collectionName = 'All-in-One_Alerts'; // Replace with your collection name
    const collection = db.collection(collectionName);
    const documents = await collection.find({}).toArray();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data' });
  }
});


// Start the server
app.listen(port, async () => {
  await connectToMongoDB();
  console.log(`Server running on port ${port}`);
});
