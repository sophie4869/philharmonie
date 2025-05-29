import ConcertsClient from "../../components/ConcertsClient";
import { connectToDatabase } from "../../lib/mongodb";

interface Concert {
  title: string;
  description: string;
  location: string;
  image_url: string;
  booking_url: string;
  prices: number[];
  date: string;
  category: string;
}

async function getConcerts(): Promise<Concert[]> {
  const { db } = await connectToDatabase();
  const concerts = await db.collection("concerts").find({}).sort({ date: 1 }).toArray();
  return concerts.map(({ _id, ...rest }) => rest as Concert);
}

export default async function ConcertsPage() {
  const concerts = await getConcerts();
  const categories = Array.from(new Set(concerts.map((c) => c.category).filter(Boolean)));
  return <ConcertsClient concerts={concerts} categories={categories} />;
}