import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { EmailPreferences } from '@/lib/models/EmailPreferences';
import { sendAlert, sendPreferencesUpdateEmail } from '@/lib/email';

interface SavePreferencesRequest {
  email: string;
  subscribedMusicians: { name: string; role?: string }[];
  digestFrequency: 'monthly' | 'quarterly' | 'yearly';
}

export async function POST(request: Request) {
  try {
    const body: SavePreferencesRequest = await request.json();
    const { email, subscribedMusicians, digestFrequency } = body;

    // Validate input
    if (!email || !subscribedMusicians || !digestFrequency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!Array.isArray(subscribedMusicians)) {
      return NextResponse.json(
        { error: 'subscribedMusicians must be an array' },
        { status: 400 }
      );
    }

    if (!['monthly', 'quarterly', 'yearly'].includes(digestFrequency)) {
      return NextResponse.json(
        { error: 'Invalid digest frequency' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get existing preferences to check for changes
    const existingPreferences = await EmailPreferences.findOne({ email });
    const existingMusicians = existingPreferences?.subscribedMusicians || [];

    // Save preferences
    const preferences = await EmailPreferences.findOneAndUpdate(
      { email },
      {
        email,
        subscribedMusicians,
        digestFrequency,
        isActive: true,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Send welcome email for new subscriptions
    if (!existingPreferences) {
      try {
        const welcomeContent = `
          <h2>Welcome to Philharmonie Email Alerts!</h2>
          <p>Thank you for subscribing to our email alerts. You will receive updates about concerts featuring your selected musicians:</p>
          <ul>
            ${subscribedMusicians.map(m => `<li>${m.name}${m.role ? ` (${m.role})` : ''}</li>`).join('')}
          </ul>
          <p>You will receive these updates ${digestFrequency}.</p>
          <p>You can manage your preferences at any time by visiting your email preferences page.</p>
        `;

        await sendAlert(
          email,
          'Welcome',
          {
            title: 'Welcome to Philharmonie Email Alerts',
            description: welcomeContent,
            location: 'Online',
            image_url: '',
            booking_url: '',
            prices: [],
            date: new Date().toISOString(),
            category: 'Welcome',
            program: [],
            musicians: [],
            status: 'available'
          }
        );
      } catch (error) {
        console.error('Error sending welcome email:', error);
        // Don't fail the request if welcome email fails
      }
    }

    // Send notifications for newly subscribed musicians
    const newMusicians = subscribedMusicians.filter(
      newM => !existingMusicians.some(existingM => existingM.name === newM.name)
    );

    if (newMusicians.length > 0) {
      try {
        await sendPreferencesUpdateEmail(email, { digestFrequency, subscribedMusicians });
      } catch (error) {
        console.error('Error sending preferences update email:', error);
        // Don't fail the request if notification email fails
      }
    }

    return NextResponse.json({
      success: true,
      preferences,
      message: 'Preferences saved successfully'
    });
  } catch (error) {
    console.error('Error saving email preferences:', error);
    return NextResponse.json(
      { error: 'Failed to save email preferences' },
      { status: 500 }
    );
  }
} 