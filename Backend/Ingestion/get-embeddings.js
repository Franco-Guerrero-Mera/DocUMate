import OpenAI from 'openai';

// Function to generate embeddings for a given data source
export async function getEmbedding(data) {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });

    // Use the correct method for embeddings and a valid model
    const response = await openai.embeddings.create({
        model: "text-embedding-ada-002",  // This is the valid model name
        input: data,
    });
    
    return response.data[0].embedding;  // Fixed array access to get the embedding
}
