import ConcertsClient from "../../components/ConcertsClient";
import { connectToDatabase } from "../../lib/mongodb";
import { ProgramItem } from "../../utils/scraping";
import PaletteWrapper from '../../components/PaletteWrapper';

interface Concert {
  title: string;
  description: string;
  location: string;
  image_url: string;
  booking_url: string;
  prices: number[];
  date: string;
  category: string;
  program: ProgramItem[];
}

async function getConcerts(): Promise<Concert[]> {
  const { db } = await connectToDatabase();
  const concerts = await db.collection("concerts").find({}).sort({ date: 1 }).toArray();
  return concerts.map(({ _id: _, ...rest }) => rest as Concert);
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