import dotenv from 'dotenv';
dotenv.config();

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MongoClient } from 'mongodb';
import { getEmbedding } from './get-embeddings.js';
import * as fs from 'fs';

async function run() {
    const client = new MongoClient(process.env.ATLAS_CONNECTION_STRING);
// DONT FORGET TO CHANGE DATABASE NAME AND COLLECTION NAME FROM RAG-VECTOR-INDEX.js
    try {
        // Download the PDF
        const rawData = await fetch("https://www.uscis.gov/sites/default/files/document/forms/i-130.pdf"); //<-- Replace with the actual URL
        const pdfBuffer = await rawData.arrayBuffer();
        const pdfData = Buffer.from(pdfBuffer);
        fs.writeFileSync("I-130Form.pdf", pdfData);//<-- Replace with the PDF name

        // Load and chunk the PDF
        const loader = new PDFLoader("I-130Form.pdf");//<-- Replace with PDF name (must be same as above)
        const data = await loader.load();
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 400,
            chunkOverlap: 20,
        });
        const docs = await textSplitter.splitDocuments(data);
        console.log(`✅ Successfully chunked the PDF into ${docs.length} documents.`);

        // Connect to MongoDB
        await client.connect();
        const db = client.db("rag_db"); //<-- Replace with your database name
        const collection = db.collection("I-130instr");// <-- Replace with your collection name

        console.log("⚙️ Generating embeddings and inserting documents in batches...");

        // Process documents in batches
        const batchSize = 50;
        for (let i = 0; i < docs.length; i += batchSize) {
            const batch = docs.slice(i, i + batchSize);
            const insertDocuments = [];

            for (const doc of batch) {
                const embedding = await getEmbedding(doc.pageContent);
                insertDocuments.push({
                    document: doc,
                    embedding: embedding
                });
            }

            try {
                const options = { ordered: false };
                const result = await collection.insertMany(insertDocuments, options);
                console.log(`✅ Inserted ${result.insertedCount} documents in batch ${i / batchSize + 1}`);
            } catch (err) {
                console.error("❌ Error inserting batch:", err);
            }
        }

        console.log("🎉 All documents processed and inserted!");
    } catch (err) {
        console.error("❌ Error in run():", err.stack);
    } finally {
        await client.close();
        console.log("🔌 MongoDB connection closed.");
    }
}

run().catch(console.dir);
