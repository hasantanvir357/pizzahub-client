import { NextResponse } from 'next/server';

// Auth API placeholder. Wire up better-auth here once server credentials
// (e.g. MONGODB_URI) are configured in .env.local.
const notConfigured = () =>
  NextResponse.json({ error: 'Authentication service is not configured yet.' }, { status: 501 });

export function GET() {
  return notConfigured();
}

export function POST() {
  return notConfigured();
}
