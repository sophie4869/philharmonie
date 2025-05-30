import { Collection } from 'mongodb';
import { Concert } from './scraping';

export async function checkConcert(collection: Collection, concert: Partial<Concert>): Promise<boolean> {
  const existingConcert = await collection.findOne({
    title: concert.title,
    date: concert.date
  });
  return !!existingConcert;
}
