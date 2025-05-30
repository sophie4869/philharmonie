import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import { Concert } from '@/lib/models/Concert';

export async function POST() {
  try {
    await connectToDatabase();
    
    // Get all concerts
    const concerts = await Concert.find({}).lean();
    let updatedCount = 0;

    // Update each concert's category
    for (const concert of concerts) {
      if (concert.category) {
        const cleanedCategory = concert.category
          .trim()
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .replace(/\n/g, ' ') // Replace newlines with space
          .trim(); // Trim again after replacements

        if (cleanedCategory !== concert.category) {
          await Concert.findByIdAndUpdate(
            concert._id,
            { $set: { category: cleanedCategory } }
          );
          updatedCount++;
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      stats: {
        total: concerts.length,
        updated: updatedCount
      }
    });
  } catch (error) {
    console.error('Error cleaning categories:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
} 