import ConcertsClient from "../../components/ConcertsClient";
import { connectToDatabase } from "../../lib/mongodb";
import { Concert, ProgramItem, Musician } from "../../utils/scraping";
import PaletteWrapper from '../../components/PaletteWrapper';
import { Document, WithId } from 'mongodb';

interface ConcertDocument extends Document {
  title: string;
  description: string;
  location: string;
  image_url: string;
  booking_url: string;
  prices: number[];
  date: string;
  category: string;
  program: ProgramItem[];
  musicians: Musician[];
  status: 'available' | 'few_remaining' | 'sold_out';
}

async function getConcerts(): Promise<Concert[]> {
  const { db } = await connectToDatabase();
  const concertsFromDB = await db.collection("concerts").find({}).sort({ date: 1 }).toArray();

  return concertsFromDB.map((dbConcert: WithId<ConcertDocument>) => {
    const { ...restOfConcert } = dbConcert;
    return {
      title: restOfConcert.title || '',
      description: restOfConcert.description || '',
      location: restOfConcert.location || '',
      image_url: restOfConcert.image_url || '',
      booking_url: restOfConcert.booking_url || '',
      prices: restOfConcert.prices || [],
      date: String(restOfConcert.date || ''),
      category: restOfConcert.category || '',
      program: restOfConcert.program || [],
      musicians: restOfConcert.musicians || [],
      status: restOfConcert.status || 'available',
    } as Concert;
  });
}

export default async function ConcertsPage() {
  const concerts = await getConcerts();
  const categories = Array.from(new Set(concerts.map((c) => c.category).filter(Boolean)));
  return (
    <PaletteWrapper>
      <ConcertsClient concerts={concerts} categories={categories} />
    </PaletteWrapper>
  );
}