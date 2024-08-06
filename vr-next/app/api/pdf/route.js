// app/api/upload/route.js
export const dynamic = 'force-dynamic' // defaults to auto
import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import axios from 'axios';

export async function POST(request) {
    const data = await request.formData();
    const file = data.get('file');
  
    const buffer = await file.arrayBuffer();
    const text = await extractTextFromPDF(Buffer.from(buffer));
    console.log(text);
    // Get environment descriptions from GPT-4 API
    let description = await getEnvironmentDescriptions(text);
    //Clean the ```json``` from the response
    description = description.replace(/```json/g, '').replace(/```/g, '').trim();
    
    //convert the string into an array of strings
    description = JSON.parse(description);
    return Response.json(description);
  }

  const extractTextFromPDF = async (buffer) => {
    const data = await pdfParse(buffer);
    return data.text;
  };
  
  
  const getEnvironmentDescriptions = async (text) => {
    const apiKey = process.env.OPENAI_API_KEY;
  
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
          "model": "gpt-4o-mini",
          "messages": [
            {
              "role": "system",
              "content": `You are an AI assistant with the goal of helping a user understand the enviroments of the different chapters in a book.
              Your task is to, given a book, provide a description of the enviroment in the chapter.
              The enviroment description should be one sentence and concise because it will be used to generate an image of the enviroment with Stable Diffusion in 360, avoid including things that cannot be representated with an image.
              The response format should be in JSON, specifically an array of strings. Where each item in the array is a description of the enviroment in a chapter(in order).
              The book can be in english or spanish but your response should be in english.
              Example response of a book with 2 chapters: 
              \`\`\`json
              ["A dark and gloomy forest with tall trees and a thick fog.", "A bright and sunny beach with white sand and clear blue water."]
              \`\`\`
              `
            },
            {
              "role": "user",
              "content": `This is the book: ${text}`
            }
          ]
      }, {
        headers: { Authorization: `Bearer ${apiKey}`,
      },
      });
  
      return response.data.choices[0].message.content;
    
  };