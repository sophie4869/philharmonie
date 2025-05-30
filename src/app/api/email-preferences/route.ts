import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { EmailPreferences } from '@/lib/models/EmailPreferences';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { email, subscribedMusicians, digestFrequency } = body;

    const preferences = await EmailPreferences.findOneAndUpdate(
      { email },
      {
        email,
        subscribedMusicians,
        digestFrequency,
        isActive: true,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error saving email preferences:', error);
    return NextResponse.json(
      { error: 'Failed to save email preferences' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    const preferences = await EmailPreferences.findOne({ email });
    return NextResponse.json(preferences || { email, subscribedMusicians: [], digestFrequency: 'weekly' });
  } catch (error) {
    console.error('Error fetching email preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email preferences' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    await EmailPreferences.findOneAndUpdate(
      { email },
      { isActive: false }
    );

    return NextResponse.json({ message: 'Email preferences deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating email preferences:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate email preferences' },
      { status: 500 }
    );
  }
} 