const { MongoClient } = require('mongodb');
const testJobs = require('./testData');

const uri = "mongodb://localhost:27017/jobportal";

async function insertTestData() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    const db = client.db("mernJobPortal");
    const jobsCollection = db.collection("demoJobs");
    
    // Vérifier si la collection existe déjà
    const collections = await db.listCollections().toArray();
    const collectionExists = collections.some(col => col.name === "demoJobs");
    
    if (!collectionExists) {
      await db.createCollection("demoJobs");
      console.log("Collection demoJobs created");
    }
    
    // Insérer les données de test
    const result = await jobsCollection.insertMany(testJobs);
    console.log(`${result.insertedCount} documents inserted`);
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}

insertTestData(); 