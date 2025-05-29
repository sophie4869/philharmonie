import puppeteer from 'puppeteer';

export interface Concert {
  title: string;
  description: string;
  location: string;
  image_url: string;
  booking_url: string;
  prices: number[];
  status: 'available' | 'few_remaining' | 'sold_out';
  date: string;
  category: string;
}

const BASE_URL = 'https://philharmoniedeparis.fr/en/calendar?genreGps=2%2B&page=30';

async function fetchConcerts(): Promise<Concert[]> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });

  // Wait for at least one event card to appear
  await page.waitForSelector('.EventCard-content', { timeout: 15000 });

  const concerts: Concert[] = await page.evaluate(() => {
    const results: Concert[] = [];
    const dateWrappers = document.querySelectorAll('.calendar-date-wrapper');
    dateWrappers.forEach(dateWrapper => {
      const date = (dateWrapper.querySelector('h2.calendar-date')?.textContent || '').trim();
      let next = dateWrapper.nextElementSibling;
      while (next && !next.classList.contains('calendar-date-wrapper')) {
        next.querySelectorAll('.EventCard-content').forEach(card => {
          const title = (card.querySelector('.EventCard-title')?.textContent || '').trim();
          const description = (card.querySelector('.EventCard-description p')?.textContent || '').trim();
          const location = (card.querySelector('.EventCard-place')?.textContent || '').trim();
          const defaultImage = "https://philharmoniedeparis.fr/themes/custom/pdp_theme/images/sprite.svg?v1.0#logo-pp-vertical";
          const imageSrc = (card.parentElement?.querySelector('.Card-image img')?.getAttribute('src') || '').trim();
          const image_url = imageSrc
            ? (imageSrc.startsWith('http') ? imageSrc : `https://philharmoniedeparis.fr${imageSrc}`)
            : defaultImage;
          const bookingSuffix = card.querySelector('.EventCard-button')?.getAttribute('href') || '';
          const booking_url = `https://philharmoniedeparis.fr${bookingSuffix}`;
          const priceNodes = card.querySelectorAll('.Prices-price');
          const prices = Array.from(priceNodes).map(p => parseFloat(p.textContent?.replace('€', '').trim() || '')).filter(n => !isNaN(n));
          const availabilityText = (card.querySelector('.event-availabilityAlert')?.textContent || '').toLowerCase();
          const status = availabilityText.includes('last') ? 'few_remaining'
            : availabilityText.includes('sold') ? 'sold_out'
            : 'available';
          const category = (card.querySelector('.EventCard-category')?.textContent || '').trim();
          results.push({
            title,
            description,
            location,
            image_url,
            booking_url,
            prices,
            status,
            date,
            category,
          });
        });
        next = next.nextElementSibling;
      }
    });
    return results;
  });

  await browser.close();
  return concerts;
}

export { fetchConcerts };