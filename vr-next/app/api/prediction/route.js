export const dynamic = 'force-dynamic' // defaults to auto
import { NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
    auth: process.env.REPLICATE_AUTH,
});

export async function POST(request) {
    const {prompt} = await request.json();

    let response = await replicate.run(
        "lucataco/sdxl-panoramic:76acc4075d0633dcb3823c1fed0419de21d42001b65c816c7b5b9beff30ec8cd",
        {
            input: {
                seed: 1335,
                prompt
            }
        }
    );
    const input = {
        image: response
    };
    
    response = await replicate.run("philz1337x/clarity-upscaler:dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e", { input });
    

    return NextResponse.json(response);
}