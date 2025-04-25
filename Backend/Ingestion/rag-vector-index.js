import dotenv from 'dotenv';
dotenv.config();

import { MongoClient } from 'mongodb';

// Connect to your Atlas cluster
const client = new MongoClient(process.env.ATLAS_CONNECTION_STRING);

async function run() {
    try {
      const database = client.db("rag_db"); // <-- Replace with your database name
      const collection = database.collection("I-130instr"); // <-- Replace with your collection name
     
      // Define your Atlas Vector Search index
      const index = {
          name: "vector_index",
          type: "vectorSearch",
          definition: {
            "fields": [
              {
                "type": "vector",
                "numDimensions": 768,
                "path": "embedding",
                "similarity": "cosine"
              }
            ]
          }
      }
 
      // Call the method to create the index
      const result = await collection.createSearchIndex(index);
      console.log(result);
    } finally {
      await client.close();
    }
}
run().catch(console.dir);