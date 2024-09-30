export const dynamic = 'force-dynamic'; // defaults to auto
import { NextResponse } from 'next/server';
import Replicate from 'replicate';
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAI } from 'openai';
import sharp from 'sharp';

const replicate = new Replicate({
    auth: process.env.REPLICATE_AUTH,
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const pc = new Pinecone();  // No need to pass the apiKey directly if it's in the environment variable


async function processImage(imageUrl) {
    try {
        // Fetch the image as a buffer
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        // Use arrayBuffer and convert to Buffer
        const arrayBuffer = await response.arrayBuffer();
        const imageBuffer = Buffer.from(arrayBuffer);

        // Get image metadata
        const metadata = await sharp(imageBuffer).metadata();
        const { width, height, format } = metadata;

        // Debugging logs
        console.log('Image Metadata:', metadata);

        if (!width || !height) {
            throw new Error('Unable to retrieve image dimensions.');
        }

        // Calculate half widths
        const halfWidth = Math.floor(width / 2);
        const otherHalfWidth = width - halfWidth;

        console.log(`Image Width: ${width}, Half Width: ${halfWidth}, Other Half Width: ${otherHalfWidth}, Height: ${height}`);

        // Ensure halfWidth and height are valid
        if (halfWidth <= 0 || otherHalfWidth <= 0 || height <= 0) {
            throw new Error('Invalid dimensions for image extraction.');
        }

        let leftBuffer, rightBuffer;

        // Extract left half using a new sharp instance
        try {
            const leftHalf = await sharp(imageBuffer).extract({ left: 0, top: 0, width: halfWidth, height }).toBuffer();
            leftBuffer = leftHalf;
            console.log('Left half extracted successfully');
        } catch (error) {
            console.error('Error extracting left half:', error);
            throw new Error(`Failed to extract left half: ${error.message}`);
        }

        // Extract right half using a new sharp instance
        try {
            const rightHalf = await sharp(imageBuffer).extract({ left: halfWidth, top: 0, width: otherHalfWidth, height }).toBuffer();
            rightBuffer = rightHalf;
            console.log('Right half extracted successfully');
        } catch (error) {
            console.error('Error extracting right half:', error);
            throw new Error(`Failed to extract right half: ${error.message}`);
        }

        // Swap the halves and composite them
        try {
            const swappedImageBuffer = await sharp({
                create: {
                    width,
                    height,
                    channels: 3, // Match the original image channels
                    background: { r: 0, g: 0, b: 0 }
                }
            })
            .composite([
                { input: rightBuffer, left: 0, top: 0 },         // Right half on the left
                { input: leftBuffer, left: halfWidth, top: 0 } // Left half on the right
            ])
            .png()
            .toBuffer();

            console.log('Swapped image composited successfully');

            // Convert the swapped image to Base64
            const base64Image = swappedImageBuffer.toString('base64');

            // Return the Base64 string with the data URI prefix
            return `data:image/png;base64,${base64Image}`;
        } catch (error) {
            console.error('Error compositing swapped image:', error);
            throw new Error(`Failed to composite swapped image: ${error.message}`);
        }
    } catch (error) {
        console.error('Error processing image:', error);
        throw error;
    }
}

async function loadMaskImageFromUrl(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch mask image: ${response.statusText}`);
        }

        // Use arrayBuffer and convert to Buffer
        const arrayBuffer = await response.arrayBuffer();
        const maskBuffer = Buffer.from(arrayBuffer);

        // Convert to Base64
        const base64Mask = maskBuffer.toString('base64');

        // Create the Data URI
        const dataUriMask = `data:image/png;base64,${base64Mask}`;

        return dataUriMask;
    } catch (error) {
        console.error('Error loading mask image from URL:', error);
        throw error;
    }
}


export async function POST(request) {
    const { prompt, userPreferences, improvePrompt } = await request.json();

    let enhancedPrompt = prompt;
    if (improvePrompt) {
        enhancedPrompt = await improvePromptWithPreferences(prompt, userPreferences);
    }
    console.log(enhancedPrompt)
    enhancedPrompt += ". 360 view in the TOK style"

    let response = await replicate.run(
        "igorriti/flux-360:d26037255a2b298408505e2fbd0bf7703521daca8f07e8c8f335ba874b4aa11a",
        {input:{
            "model": "dev",
            "prompt": enhancedPrompt,
            "lora_scale": 1,
            "num_outputs": 1,
            "aspect_ratio": "3:2",
            "output_format": "png",
            "guidance_scale": 3.5,
            "output_quality": 80,
            "prompt_strength": 0.8,
            "extra_lora_scale": 0.8,
            "num_inference_steps": 28
        }}
    )

    const processedImage = await processImage(response[0]);
    //console.log(processedImage);
    let maskImage = process.env.PUBLIC_URL + '/resources/mask.png';
    maskImage = await loadMaskImageFromUrl(maskImage);
    console.log("Mask image successfully loaded from URL");
    const inpaintResponse = await replicate.run(
      "vetkastar/fooocus:d555a800025fe1c171e386d299b1de635f8d8fc3f1ade06a14faf5154eba50f3",
        {
            input:{
                prompt: prompt,
                inpaint_additional_prompt: prompt,
                inpaint_input_image: processedImage,
                inpaint_input_mask: maskImage, //Here it goes the mask image loaded from the URL/resources/mask.png in b64
                inpaint_strength: 1
            }
        }
    )
    const upscaleResponse = await replicate.run(
        "nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
        {
          input: {
            image: inpaintResponse["paths"][0],
            scale: 2,
            face_enhance: false
          }
        }
      );
    response = upscaleResponse
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
    response = [response]
    // Return the generated image URL and YouTube ID in the response
    return NextResponse.json({ image: response, id: youtubeId });
}

async function improvePromptWithPreferences(prompt, userPreferences) {
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: `You are an AI assistant that improves image generation prompts. Tried to not include lot of details, it should be concise and not talk about feelings. You cannot use words like "Landscape"
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
