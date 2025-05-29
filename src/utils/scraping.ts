import * as puppeteer from 'puppeteer';

export interface ProgramItem {
  composer: string;
  title: string;
  details?: string;
  isIntermission?: boolean;
}

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
  program: ProgramItem[];
}

const BASE_URL = 'https://philharmoniedeparis.fr/en/calendar?genreGps=2%2B&page=30';

async function fetchProgramDetails(page: puppeteer.Page, url: string): Promise<ProgramItem[]> {
  console.log(`Fetching program details from: ${url}`);
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  const programItems = await page.evaluate(() => {
    const items: ProgramItem[] = [];
    
    // First check for program blocks (composer + title format)
    const programBlocks = document.querySelectorAll('.program-block, .program-intermission');
    if (programBlocks.length > 0) {
      programBlocks.forEach(block => {
        if (block.classList.contains('program-intermission')) {
          items.push({
            composer: '',
            title: 'Intermission',
            isIntermission: true
          });
        } else {
          const composer = block.querySelector('.program-composer')?.textContent?.trim() || '';
          const title = block.querySelector('.program-title')?.textContent?.trim() || '';
          const details = block.querySelector('.program-comOeuvre')?.textContent?.trim();
          
          items.push({
            composer,
            title,
            details
          });
        }
      });
    } else {
      // If no program blocks found, look for simple program titles
      const programTitles = document.querySelectorAll('.program-title');
      programTitles.forEach(title => {
        const titleText = title.textContent?.trim() || '';
        if (titleText) {
          items.push({
            composer: '',
            title: titleText
          });
        }
      });
    }
    
    return items;
  });
  
  console.log(`Found ${programItems.length} program items`);
  return programItems;
}

type ConcertCheckFunction = (concert: Partial<Concert>) => Promise<boolean>;

async function fetchConcerts(
  checkExistingConcert: ConcertCheckFunction,
  onConcertComplete: (concert: Concert) => Promise<void>
): Promise<void> {
  console.log('Starting concert scraping...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log(`Navigating to ${BASE_URL}`);
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });

  // Wait for at least one event card to appear
  console.log('Waiting for event cards to load...');
  await page.waitForSelector('.EventCard-content', { timeout: 15000 });

  console.log('Scraping concert list...');
  const concerts: Partial<Concert>[] = await page.evaluate(() => {
    const results: Partial<Concert>[] = [];
    const dateWrappers = document.querySelectorAll('.calendar-date-wrapper');
    console.log(`Found ${dateWrappers.length} date wrappers`);
    
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
          
          // Only add concerts that have a booking URL
          if (bookingSuffix) {
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
              program: []
            });
          }
        });
        next = next.nextElementSibling;
      }
    });
    return results;
  });

  console.log(`Found ${concerts.length} concerts. Starting to fetch program details...`);

  let skippedEmptyProgramCount = 0;
  let fetchedProgramCount = 0;
  let emptyProgramCount = 0;

  // Fetch program details for each concert
  for (let i = 0; i < concerts.length; i++) {
    const concert = concerts[i];
    if (!concert.booking_url) continue; // Skip if no booking URL

    console.log(`[${i + 1}/${concerts.length}] Processing: ${concert.title}`);

    // Check if we need to fetch program details
    const needsProgram = !(await checkExistingConcert(concert));
    
    if (needsProgram) {
      try {
        concert.program = await fetchProgramDetails(page, concert.booking_url);
        if (concert.program.length === 0) {
          console.log(`No program found for: ${concert.title}`);
          emptyProgramCount++;
        } else {
          fetchedProgramCount++;
        }
      } catch (error) {
        console.error(`Failed to fetch program for concert: ${concert.title}`, error);
        concert.program = [];
        emptyProgramCount++;
      }
    } else {
      console.log(`Skipping program fetch for: ${concert.title} (already exists)`);
      skippedEmptyProgramCount++;
    }

    // Save the concert to database
    await onConcertComplete(concert as Concert);
  }

  console.log('\nScraping completed successfully!');
  console.log('Final Statistics:');
  console.log(`- Total concerts processed: ${concerts.length}`);
  console.log(`- Programs fetched: ${fetchedProgramCount}`);
  console.log(`- Empty programs: ${emptyProgramCount}`);
  console.log(`- Skipped (already exists): ${skippedEmptyProgramCount}`);
  console.log(`- Missing program percentage: ${((emptyProgramCount / concerts.length) * 100).toFixed(1)}%`);

  await browser.close();
}

export { fetchConcerts };