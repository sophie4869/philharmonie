import { Collection } from 'mongodb';
import { Concert } from './scraping';

export async function checkExistingConcert(collection: Collection, concert: Partial<Concert>): Promise<boolean> {
  if (!concert.title || !concert.date) return false;

  const existingConcert = await collection.findOne({
    title: concert.title,
    date: concert.date
  });

  // Consider the concert as needing update if it exists but has no time
  if (existingConcert && !existingConcert.time) {
    return false;
  }

  return !!existingConcert;
}
