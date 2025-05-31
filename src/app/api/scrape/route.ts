import { NextResponse } from 'next/server';
import { fetchConcerts } from '../../../utils/scraping';
import { connectToDatabase } from '../../../lib/mongodb';
import { checkExistingConcert } from '../../../utils/checkConcert';
import { Concert } from '@/lib/models/Concert';
import mongoose from 'mongoose';

export async function POST() {
  try {
    await connectToDatabase();
    let processedCount = 0;
    let skippedCount = 0;
    let missingProgramCount = 0;
    let totalConcerts = 0;

    await fetchConcerts(
      checkExistingConcert,
      async (concert) => {
        // Log the length of program and musicians found
        console.log(`[API] Updating ${concert.title} (${concert.date} ${concert.time}): program.length=${concert.program.length}, musicians.length=${concert.musicians.length}`);

        // Only update program/musicians if new data is non-empty
        const updateFields = { ...concert };
        if (concert.program.length === 0) delete updateFields.program;
        if (concert.musicians.length === 0) delete updateFields.musicians;

        // Generate a unique ID based on title, date, and time
        const uniqueId = `${concert.title}-${concert.date}-${concert.time}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
        updateFields.id = uniqueId;

        totalConcerts++;
        const result = await Concert.findOneAndUpdate(
          { title: concert.title, date: concert.date, time: concert.time },
          { $set: updateFields },
          { upsert: true, new: true }
        );
        
        if (result) {
          processedCount++;
          if (concert.program.length === 0) {
            missingProgramCount++;
          }
        } else {
          skippedCount++;
        }
      },
      mongoose.connection.collection('concerts')
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
    await connectToDatabase();
    const concerts = await Concert.find({})
      .sort({ date: 1 })
      .lean()
      .then(docs => JSON.parse(JSON.stringify(docs)));
    return NextResponse.json({ success: true, concerts });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
} 