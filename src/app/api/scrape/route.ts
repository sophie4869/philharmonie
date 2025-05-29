import { NextRequest, NextResponse } from 'next/server';
import { fetchConcerts } from '../../../utils/scraping';
import { connectToDatabase } from '../../../lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const concerts = await fetchConcerts();
    const { db } = await connectToDatabase();
    const collection = db.collection('concerts');

    // Upsert concerts by title + date (basic deduplication)
    for (const concert of concerts) {
      await collection.updateOne(
        { title: concert.title, date: concert.date },
        { $set: concert },
        { upsert: true }
      );
    }

    return NextResponse.json({ success: true, count: concerts.length });
  } catch (error) {
    console.error('Error fetching concerts:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('concerts');
    const concerts = await collection.find({}).sort({ date: 1 }).toArray();
    return NextResponse.json({ success: true, concerts });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
} 