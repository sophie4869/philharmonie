import 'dotenv/config';
import mongoose from 'mongoose';
import { connectToDatabase } from '../lib/mongodb';
import { Concert } from '../lib/models/Concert';
import { EmailPreferences } from '../lib/models/EmailPreferences';
import { sendMusicianDigest, sendDigestForAllMusicians } from '../lib/email';
import { Concert as ConcertType } from '../utils/scraping';
import { parse, isAfter } from 'date-fns';

// Verify environment variables
if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_API_SECRET) {
  console.error('Mailjet API credentials are required');
  process.exit(1);
}

if (!process.env.MONGODB_URI) {
  console.error('MongoDB URI is required');
  process.exit(1);
}

// Validate frequency argument
const validFrequencies = ['monthly', 'quarterly', 'yearly'] as const;
type Frequency = typeof validFrequencies[number];

const frequency = process.argv[2] as Frequency;
if (!frequency || !validFrequencies.includes(frequency)) {
  console.error('Please provide a valid frequency: monthly, quarterly, or yearly');
  process.exit(1);
}

async function getUpcomingConcerts(musicianName: string): Promise<ConcertType[]> {
  // Find concerts for the musician (case-insensitive, partial match)
  const concerts = await Concert.find({
    musicians: { $elemMatch: { name: { $regex: musicianName, $options: 'i' } } }
  }).lean();

  const now = new Date();

  // Parse and filter for future concerts
  const formattedConcerts = concerts.filter(concert => {
    let parsedDate: Date;
    if (typeof concert.date === 'string') {
      // Parse the date string (e.g., "Thursday, 5 June 2025")
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

  console.log(`Found ${formattedConcerts.length} upcoming concerts for ${musicianName}`);
  return formattedConcerts;
}

async function sendDigests() {
  console.log(`Starting ${frequency} digest sending...`);
  
  try {
    // Connect to database
    await connectToDatabase();
    console.log('Connected to database');

    // Get subscribers with matching frequency
    const subscribers = await EmailPreferences.find({ 
      digestFrequency: frequency,
      isActive: true 
    }).lean();
    console.log(`Found ${subscribers.length} subscribers for ${frequency} frequency`);

    // For each subscriber, check their subscribed musicians
    for (const subscriber of subscribers) {
      console.log(`Processing subscriber: ${subscriber.email}`);
      
      const musicianConcerts = [];
      for (const musician of subscriber.subscribedMusicians) {
        console.log(`Checking for musician: ${musician.name}`);
        
        // Get upcoming concerts for this musician
        const upcomingConcerts = await getUpcomingConcerts(musician.name);
        
        if (upcomingConcerts.length > 0) {
          console.log(`Sending digest for ${musician.name} with ${upcomingConcerts.length} concerts`);
          musicianConcerts.push({ musician: musician.name, concerts: upcomingConcerts });
        } else {
          console.log(`No upcoming concerts found for ${musician.name}`);
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

    console.log(`Finished sending ${frequency} digests`);
  } catch (error) {
    console.error('Error sending digests:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the script
sendDigests().catch(console.error); 