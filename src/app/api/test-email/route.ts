import { NextResponse } from 'next/server';
import { sendAlert } from '@/lib/email';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Send a test email
    await sendAlert(
      email,
      'Test Musician',
      {
        title: 'Test Concert',
        description: 'This is a test concert to verify email functionality',
        location: 'Test Venue',
        image_url: '',
        booking_url: 'https://example.com',
        prices: [],
        date: new Date().toISOString(),
        category: 'Test',
        program: [],
        musicians: [],
        status: 'available'
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully'
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    );
  }
} 