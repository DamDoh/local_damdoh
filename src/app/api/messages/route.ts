
// This file is intentionally left blank.
// All messaging logic is now handled by secure, callable Cloud Functions
// in `firebase/functions/src/messages.ts` to ensure a robust and
// consistent architecture. The client will call these functions directly.
// Keeping this file prevents potential 404 errors if old references exist.
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  return NextResponse.json({ error: 'This endpoint is deprecated. Please use the callable functions.' }, { status: 410 });
}

export async function POST(request: Request) {
  return NextResponse.json({ error: 'This endpoint is deprecated. Please use the callable functions.' }, { status: 410 });
}
