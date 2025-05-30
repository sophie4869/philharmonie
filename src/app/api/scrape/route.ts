import { NextResponse } from 'next/server';
import { fetchConcerts } from '../../../utils/scraping';
import { connectToDatabase } from '../../../lib/mongodb';
import { checkConcert } from '../../../utils/checkConcert';

export async function POST() {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('concerts');
    let processedCount = 0;
    let skippedCount = 0;
    let missingProgramCount = 0;
    let totalConcerts = 0;

    await fetchConcerts(
      checkConcert,
      async (concert) => {
        // Log the length of program and musicians found
        console.log(`[API] ${concert.title} (${concert.date}): program.length=${concert.program.length}, musicians.length=${concert.musicians.length}`);

        // Only update program/musicians if new data is non-empty
        const updateFields = { ...concert };
        if (concert.program.length === 0) delete updateFields.program;
        if (concert.musicians.length === 0) delete updateFields.musicians;

        totalConcerts++;
        const result = await collection.updateOne(
          { title: concert.title, date: concert.date },
          { $set: updateFields },
          { upsert: true }
        );
        
        if (result.upsertedCount > 0) {
          processedCount++;
          if (concert.program.length === 0) {
            missingProgramCount++;
          }
        } else if (result.modifiedCount > 0) {
          processedCount++;
          if (concert.program.length === 0) {
            missingProgramCount++;
          }
        } else {
          skippedCount++;
        }
      },
      collection
    );

    return NextResponse.json({ 
      success: true, 
      stats: {
        processed: processedCount,
        skipped: skippedCount,
        total: totalConcerts,
        missingPrograms: missingProgramCount,
        missingProgramPercentage: ((missingProgramCount / totalConcerts) * 100).toFixed(1) + '%'
      }
    });
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