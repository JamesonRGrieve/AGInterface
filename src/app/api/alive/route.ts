import { NextResponse } from 'next/server';

export async function GET(request) {
  return NextResponse.json(global.__RUNTIME_CONFIG__ || {});
}
