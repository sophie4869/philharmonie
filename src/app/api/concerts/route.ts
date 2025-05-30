import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Concert } from '@/lib/models/Concert';

export async function GET() {
  try {
    await connectToDatabase();
    const concerts = await Concert.find({}).lean();
    return NextResponse.json(concerts);
  } catch (error) {
    console.error('Error fetching concerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch concerts' },
      { status: 500 }
    );
  }
} 