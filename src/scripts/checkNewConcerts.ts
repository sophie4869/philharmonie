import 'dotenv/config';
import mongoose from 'mongoose';
import { connectToDatabase } from '../lib/mongodb';
import { EmailPreferences } from '../lib/models/EmailPreferences';
import { sendAlert } from '../lib/email';
import { Concert as ConcertType } from '../utils/scraping';

// Verify environment variables
if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_API_SECRET) {
  console.error('Mailjet API credentials are required');
  process.exit(1);
}

if (!process.env.MONGODB_URI) {
  console.error('MongoDB URI is required');
  process.exit(1);
}

// Test concerts to add
const testConcerts: ConcertType[] = [
  {
    title: "Test Argerich Concert",
    description: "A test concert",
    location: "Test Hall",
    image_url: "https://deneb.philharmoniedeparis.fr/uploads/images/cache/event_agenda/rc/LeqfarET/uploads/images/6745f8ed6eddb_Visuel-Ravel-site-1700x700.jpg",
    booking_url: "https://example.com/book1",
    prices: [20, 30, 40],
    status: "available",
    date: new Date().toISOString(),
    category: "Symphony",
    program: [{ title: "Concerto", composer: "Schumann" }],
    musicians: [{ name: "Martha Argerich" }]
  },
  {
    title: "Test Kissin Concert",
    description: "Another test concert",
    location: "Test Hall 2",
    image_url: "https://deneb.philharmoniedeparis.fr/uploads/images/cache/event_agenda/rc/LeqfarET/uploads/images/6745f8ed6eddb_Visuel-Ravel-site-1700x700.jpg",
    booking_url: "https://example.com/book2",
    prices: [25, 35, 45],
    status: "available",
    date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    category: "Recital",
    program: [{ title: "Nocturne", composer: "Chopin" }],
    musicians: [{ name: "Evgeny Kissin" }]
  }
];

async function checkNewConcerts() {
  console.log('Starting new concerts check...');
  
  try {
    // Connect to database
    await connectToDatabase();
    console.log('Connected to database');

    // Get all subscribers
    const subscribers = await EmailPreferences.find({}).lean();
    console.log(`Found ${subscribers.length} subscribers`);

    // For each subscriber, check if any test concerts feature their subscribed musicians
    for (const subscriber of subscribers) {
      console.log(`Processing subscriber: ${subscriber.email}`);
      
      for (const musician of subscriber.subscribedMusicians) {
        console.log(`Checking for musician: ${musician.name}`);
        
        // Filter test concerts that feature this musician
        const relevantConcerts = testConcerts.filter(concert => 
          concert.musicians.some(m => m.name === musician.name)
        );
        
        console.log(`Found ${relevantConcerts.length} concerts featuring ${musician.name}`);
        // Send one alert email per new concert for this musician
        for (const concert of relevantConcerts) {
          console.log(`Sending alert for concert: ${concert.title}`);
          await sendAlert(subscriber.email, musician.name, concert);
        }
      }
    }

    console.log('Finished processing concerts');
  } catch (error) {
    console.error('Error checking concerts:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the script
checkNewConcerts().catch(console.error); 