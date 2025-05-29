export interface Concert {
  title: string;
  date: string; // ISO 8601
  location: string;
  artists: string[];
  composers: string[];
  works: string[];
  type: string[];
  image_url: string;
  subscription_eligible: boolean;
  status: 'available' | 'sold_out' | 'few_remaining';
} 