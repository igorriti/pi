export const dynamic = 'force-dynamic'; // defaults to auto
import { NextResponse } from 'next/server';
import Replicate from 'replicate';
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAI } from 'openai';

const replicate = new Replicate({
    auth: process.env.REPLICATE_AUTH,
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const pc = new Pinecone();  // No need to pass the apiKey directly if it's in the environment variable

export async function POST(request) {
    const { prompt, userPreferences, improvePrompt } = await request.json();

    let enhancedPrompt = prompt;
    if (improvePrompt) {
        enhancedPrompt = await improvePromptWithPreferences(prompt, userPreferences);
    }

    // Generate the image using Replicate
    let response = await replicate.run(
        "lucataco/sdxl-panoramic:76acc4075d0633dcb3823c1fed0419de21d42001b65c816c7b5b9beff30ec8cd",
        {
            input: {
                prompt: enhancedPrompt
            }
        }
    );
    const input = {
        image: response
    };

    // Upscale the generated image
    response = await replicate.run("philz1337x/clarity-upscaler:dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e", { input });

    // Generate embedding for the prompt using OpenAI
    const embeddingResponse = await openai.embeddings.create({
        input: [prompt],
        model: "text-embedding-3-small"
    });

    const embedding = embeddingResponse.data[0].embedding;

    // Query Pinecone with the embedding
    const index = pc.index('audio-caption-index');
    const queryResponse = await index.query({
        topK: 1,
        vector: embedding,
        includeMetadata: true
    });

    // Extract the YouTube ID from the top result
    const topResult = queryResponse.matches[0];
    const youtubeId = topResult.metadata.id;
    console.log(topResult);

    // Return the generated image URL and YouTube ID in the response
    return NextResponse.json({ image: response, id: youtubeId });
}

async function improvePromptWithPreferences(prompt, userPreferences) {
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: `You are an AI assistant that improves image generation prompts. 
                          The user has the following preferences:
                          Style: ${userPreferences.style}
                          Things to avoid: ${userPreferences.avoid.join(', ')}
                          Enhance the given prompt to reflect these preferences without changing its core meaning.`
            },
            {
                role: "user",
                content: `Improve this prompt: ${prompt}`
            }
        ]
    });

    return response.choices[0].message.content;
}
