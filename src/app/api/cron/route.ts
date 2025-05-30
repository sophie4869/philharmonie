import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Concert } from '@/lib/models/Concert';
import { EmailPreferences } from '@/lib/models/EmailPreferences';
import { sendDigestForAllMusicians, sendAlert, sendLogEmail } from '@/lib/email';
import { parse, isAfter } from 'date-fns';

// Verify the request is from Vercel Cron
export const runtime = 'nodejs';

const logBuffer: string[] = [];

function log(message: string) {
  logBuffer.push(`[INFO] ${message}`);
  console.log(message);
}

function logError(message: string, error?: unknown) {
  const errorMsg = error ? `${message} ${JSON.stringify(error)}` : message;
  logBuffer.push(`[ERROR] ${errorMsg}`);
  console.error(message, error);
}

async function checkNewConcerts() {
  log('Checking for new concerts...');
  
  // Get all active subscribers
  const subscribers = await EmailPreferences.find({ isActive: true }).lean();
  log(`Found ${subscribers.length} active subscribers`);

  // Get all concerts from the last 7 days
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const recentConcerts = await Concert.find({
    createdAt: { $gte: oneWeekAgo }
  }).lean();
  
  log(`Found ${recentConcerts.length} new concerts in the last week`);

  // For each subscriber, check if any new concerts match their musicians
  for (const subscriber of subscribers) {
    log(`Checking new concerts for subscriber: ${subscriber.email}`);
    
    for (const musician of subscriber.subscribedMusicians) {
      const matchingConcerts = recentConcerts.filter(concert => 
        concert.musicians.some(m => 
          m.name.toLowerCase().includes(musician.name.toLowerCase())
        )
      );

      if (matchingConcerts.length > 0) {
        log(`Found ${matchingConcerts.length} new concerts for ${musician.name}`);
        
        // Send alert for each matching concert
        for (const concert of matchingConcerts) {
          try {
            // Convert the concert to the expected format
            const formattedConcert = {
              ...concert,
              date: concert.date instanceof Date ? concert.date.toISOString() : concert.date
            };
            await sendAlert(subscriber.email, musician.name, formattedConcert);
            log(`Sent alert for concert: ${concert.title}`);
          } catch (error) {
            logError(`Error sending alert for concert ${concert.title}:`, error);
          }
        }
      }
    }
  }
}

export async function GET(request: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    await connectToDatabase();
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentDay = currentDate.getDate();
    const currentDayOfWeek = currentDate.getDay(); // 0-6 (Sunday-Saturday)

    log('Cron job started at: ' + currentDate.toISOString());
    log('Current date details: ' + JSON.stringify({
      month: currentMonth,
      day: currentDay,
      dayOfWeek: currentDayOfWeek
    }));

    // Get all subscribers and their frequencies for verification
    const allSubscribers = await EmailPreferences.find({ isActive: true }).lean();
    const frequencyCounts = allSubscribers.reduce((acc, sub) => {
      acc[sub.digestFrequency] = (acc[sub.digestFrequency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    log('Current subscriber frequency distribution: ' + JSON.stringify(frequencyCounts));

    // Check if it's Monday (1) for weekly checkNewConcerts
    if (currentDayOfWeek === 1) {
      log('Running weekly checkNewConcerts...');
      await checkNewConcerts();
    }

    // Check if it's the first day of the month for monthly digests
    if (currentDay === 1) {
      log('Running monthly digests...');
      await sendDigests('monthly');
    }

    // Check if it's the first day of a quarter for quarterly digests
    if (currentDay === 1 && [1, 4, 7, 10].includes(currentMonth)) {
      log('Running quarterly digests...');
      await sendDigests('quarterly');
    }

    // Check if it's January 1st for yearly digests
    if (currentDay === 1 && currentMonth === 1) {
      log('Running yearly digests...');
      await sendDigests('yearly');
    }

    await sendLogEmail('your@email.com', logBuffer.join('\n'));
    return NextResponse.json({ 
      success: true,
      timestamp: currentDate.toISOString(),
      frequencyDistribution: frequencyCounts
    });
  } catch (error) {
    logError('Error in cron job:', error);
    await sendLogEmail('your@email.com', logBuffer.join('\n'));
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function sendDigests(frequency: 'monthly' | 'quarterly' | 'yearly') {
  // Get subscribers with matching frequency
  const subscribers = await EmailPreferences.find({ 
    digestFrequency: frequency,
    isActive: true 
  }).lean();
  log(`Found ${subscribers.length} subscribers for ${frequency} frequency`);
  log('Subscriber emails: ' + JSON.stringify(subscribers.map(s => s.email)));

  // For each subscriber, check their subscribed musicians
  for (const subscriber of subscribers) {
    log(`Processing subscriber: ${subscriber.email}`);
    
    const musicianConcerts = [];
    for (const musician of subscriber.subscribedMusicians) {
      log(`Checking for musician: ${musician.name}`);
      
      // Get upcoming concerts for this musician
      const concerts = await Concert.find({
        musicians: { $elemMatch: { name: { $regex: musician.name, $options: 'i' } } }
      }).lean();

      const now = new Date();
      const upcomingConcerts = concerts.filter(concert => {
        let parsedDate: Date;
        if (typeof concert.date === 'string') {
          parsedDate = parse(concert.date, 'EEEE, d MMMM yyyy', new Date());
        } else if (concert.date instanceof Date) {
          parsedDate = concert.date;
        } else {
          return false;
        }
        return isAfter(parsedDate, now);
      }).map(concert => ({
        ...concert,
        date: typeof concert.date === 'string' ? concert.date : concert.date.toISOString()
      }));
      
      if (upcomingConcerts.length > 0) {
        log(`Sending digest for ${musician.name} with ${upcomingConcerts.length} concerts`);
        musicianConcerts.push({ musician: musician.name, concerts: upcomingConcerts });
      }
    }

    if (musicianConcerts.length > 0) {
      // Send one email per subscriber
      await sendDigestForAllMusicians(subscriber.email, musicianConcerts);
      
      // Update lastDigestSent timestamp
      await EmailPreferences.updateOne(
        { email: subscriber.email },
        { lastDigestSent: new Date() }
      );
    }
  }
} 