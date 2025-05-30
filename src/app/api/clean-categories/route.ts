import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';

export async function POST() {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('concerts');
    
    // Get all concerts
    const concerts = await collection.find({}).toArray();
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
          await collection.updateOne(
            { _id: concert._id },
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