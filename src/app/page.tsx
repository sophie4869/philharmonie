import ConcertsClient from "../components/ConcertsClient";
import { connectToDatabase } from "../lib/mongodb";
import { Concert as ConcertType } from "../utils/scraping";
import PaletteWrapper from '../components/PaletteWrapper';
import { Concert } from '@/lib/models/Concert';

interface ProgramItem {
  title: string;
  composer?: string;
  details?: string;
  isIntermission?: boolean;
  _id?: string;
}

interface Musician {
  name: string;
  role?: string;
  _id?: string;
}

async function getConcerts(): Promise<ConcertType[]> {
  await connectToDatabase();
  const concertsFromDB = await Concert.find({}).sort({ date: 1 }).lean();

  return concertsFromDB.map((dbConcert) => ({
    title: dbConcert.title || '',
    description: dbConcert.description || '',
    location: dbConcert.location || '',
    image_url: dbConcert.image_url || '',
    booking_url: dbConcert.booking_url || '',
    prices: dbConcert.prices || [],
    date: String(dbConcert.date || ''),
    time: String(dbConcert.time || ''),
    category: dbConcert.category || '',
    program: (dbConcert.program || []).map((item: ProgramItem) => {
      const { _id, ...rest } = item;
      return _id !== undefined && _id !== null 
        ? { ...rest, _id: String(_id) } 
        : rest;
    }),
    musicians: (dbConcert.musicians || []).map((musician: Musician) => {
      const { _id, ...rest } = musician;
      return _id !== undefined && _id !== null 
        ? { ...rest, _id: String(_id) } 
        : rest;
    }),
    status: dbConcert.status || 'available',
  }));
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