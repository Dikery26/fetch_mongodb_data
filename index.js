const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');

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
    const client = new MongoClient(mongoUrl);
    await client.connect();
    db = client.db(dbName);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

app.get('/getContents', async (req, res) => {
  try {
      const collectionName = 'All-in-One_Alerts'; // Replace with your collection name
      const collection = db.collection(collectionName);

      // Pagination parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      // Calculate the number of documents to skip
      const skip = (page - 1) * limit;

      // Fetch paginated data
      const documents = await collection.find({})
          .skip(skip)
          .limit(limit)
          .toArray();

      // Map through the documents and add an `imageSrc` property for Base64 images
      const documentsWithImages = documents.map(doc => {
          if (doc.attachments && doc.attachments.length > 0) {
              doc.attachments = doc.attachments.map(attachment => {
                  return {
                      ...attachment,
                      imageSrc: `data:${attachment.mimeType};base64,${attachment.data.toString('base64')}`
                  };
              });
          }
          return doc;
      });

      res.json(documentsWithImages);
  } catch (error) {
      res.status(500).json({ error: 'Error fetching data' });
  }
});


// Start the server
app.listen(port, async () => {
  await connectToMongoDB();
  console.log(`Server running on port ${port}`);
});
