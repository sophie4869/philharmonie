import axios from 'axios';
import * as cheerio from 'cheerio';
import { Concert } from '../lib/types';

// Placeholder URL for Philharmonie concerts
const CONCERTS_URL = 'https://philharmoniedeparis.fr/en/agenda';

export async function fetchConcerts(): Promise<Concert[]> {
  const { data } = await axios.get(CONCERTS_URL);
  const $ = cheerio.load(data);
  const concerts: Concert[] = [];

  // TODO: Update selectors based on real Philharmonie HTML structure
  $('.event-listing .event').each((_, el) => {
    const title = $(el).find('.event-title').text().trim();
    const date = $(el).find('.event-date').attr('datetime') || '';
    const location = $(el).find('.event-location').text().trim();
    const artists = $(el).find('.event-artists').text().split(',').map(a => a.trim());
    const composers = $(el).find('.event-composers').text().split(',').map(c => c.trim());
    const works = $(el).find('.event-works').text().split('\n').map(w => w.trim()).filter(Boolean);
    const type = $(el).find('.event-type').text().split(',').map(t => t.trim());
    const image_url = $(el).find('img').attr('src') || '';
    const subscription_eligible = $(el).find('.event-subscription').length > 0;
    const status = $(el).find('.event-status').text().toLowerCase().includes('sold')
      ? 'sold_out'
      : $(el).find('.event-status').text().toLowerCase().includes('few')
      ? 'few_remaining'
      : 'available';

    concerts.push({
      title,
      date,
      location,
      artists,
      composers,
      works,
      type,
      image_url,
      subscription_eligible,
      status,
    });
  });

  return concerts;
} 