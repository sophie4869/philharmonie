import { MongoClient } from 'mongodb';
import { Concert } from './scraping';

export async function checkConcert(concert: Partial<Concert>): Promise<boolean> {
  const client = new MongoClient(process.env.MONGODB_URI || '');
  try {
    await client.connect();
    const db = client.db('philharmonie');
    const collection = db.collection('concerts');
    
    const existingConcert = await collection.findOne({
      title: concert.title,
      date: concert.date
    });
    
    return !!existingConcert;
  } finally {
    await client.close();
  }
}
