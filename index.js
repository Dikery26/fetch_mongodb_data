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

// Middleware setup
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

// API endpoint to get paginated email data
app.get('/getContents/All-in-One_Alerts', async (req, res) => {
  try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const collectionName = 'All-in-One_Alerts';
      const collection = db.collection(collectionName);

      const documents = await collection.find({})
          .sort({ receiveTime: -1 }) // Sort by receiveTime in descending order
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

app.get('/getContents/Crypto_Alerts', async (req, res) => {
  try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const date = req.query.date; // New parameter for date filtering

      const collectionName = 'Crypto_Alerts';
      const collection = db.collection(collectionName);

      let query = {};
      if (date) {
          query = { subject: new RegExp(`for ${date}`, 'i') };
      }

      const documents = await collection.find(query)
          .sort({ receiveTime: -1 })
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