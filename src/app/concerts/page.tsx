import ConcertsClient from "../../components/ConcertsClient";
import { connectToDatabase } from "../../lib/mongodb";
import { Concert as ConcertType } from "../../utils/scraping";
import PaletteWrapper from '../../components/PaletteWrapper';
import { Concert } from '@/lib/models/Concert';

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
    program: dbConcert.program || [],
    musicians: dbConcert.musicians || [],
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