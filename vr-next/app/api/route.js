//Make a hello world route
export const dynamic = 'force-dynamic' // defaults to auto
import { NextResponse } from 'next/server';

export async function GET(request) {
    return Response.json({ message: 'Hello World' });
}
