export interface Concert {
  title: string;
  description: string;
  location: string;
  image_url: string;
  booking_url: string;
  prices: number[];
  date: string;
  category: string;
  program: ProgramItem[];
  musicians: { name: string; role?: string }[];
  status: 'available' | 'sold_out' | 'few_remaining';
}

export interface ProgramItem {
  title: string;
  composer?: string;
  details?: string;
  isIntermission?: boolean;
} 