import * as puppeteer from 'puppeteer';
import { writeFileSync } from 'fs';

export interface Musician {
  name: string;
  role?: string;
}

export interface ProgramItem {
  title: string;
  composer?: string;
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
  status: 'available' | 'sold_out' | 'few_remaining';
  date: string;
  category: string;
  program: ProgramItem[];
  musicians: Musician[];
}

// const BASE_URL = 'https://philharmoniedeparis.fr/en/calendar?genreGps=2%2B&page=30'; // Old URL
const BASE_URL = 'https://philharmoniedeparis.fr/en/calendar?genreGps=2%2B3'; // New base URL for clicking "Next days"

async function fetchMusicianDetails(page: puppeteer.Page): Promise<Musician[]> {
  const musicians = await page.evaluate(() => {
    const items: Musician[] = [];
    const distribLines = document.querySelectorAll('.distrib-line');
    
    distribLines.forEach(line => {
      const name = line.querySelector('.distrib-title')?.textContent?.trim() || '';
      const role = line.querySelector('.distrib-roles')?.textContent?.trim().replace(/^,\s*/, '') || '';
      
      if (name) {
        items.push({
          name,
          role: role || undefined
        });
      }
    });
    
    // console.log(`Found ${musicians.length} musicians`); // Keep logs minimal in main fetch
    return items;
  });
  
  // console.log(`Found ${musicians.length} musicians`); // Keep logs minimal in main fetch
  return musicians;
}

async function fetchProgramDetails(page: puppeteer.Page, url: string): Promise<{ program: ProgramItem[], musicians: Musician[] }> {
  // console.log(`Fetching program details from: ${url}`);
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  const [programItems, musicianItems] = await Promise.all([
    page.evaluate(() => {
      const items: ProgramItem[] = [];
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
            items.push({ composer, title, details });
          }
        });
      } else {
        const programTitles = document.querySelectorAll('.program-title');
        programTitles.forEach(titleEl => {
          const titleText = titleEl.textContent?.trim() || '';
          if (titleText) items.push({ composer: '', title: titleText });
        });
      }
      return items;
    }),
    fetchMusicianDetails(page)
  ]);

  if (programItems.length === 0 || musicianItems.length === 0) {
    console.warn(`[DEBUG] Empty program or musicians for URL: ${url}`);
    console.warn(`[DEBUG] Program count: ${programItems.length}, Musicians count: ${musicianItems.length}`);
  }
  
  // console.log(`Found ${programItems.length} program items and ${musicianItems.length} musicians`);
  return { program: programItems, musicians: musicianItems };
}

type ConcertCheckFunction = (concert: Partial<Concert>) => Promise<boolean>;

async function fetchConcerts(
  checkExistingConcert: ConcertCheckFunction,
  onConcertComplete: (concert: Concert) => Promise<void>
): Promise<void> {
  console.log('Starting concert scraping with "Next days" click strategy...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36');
  
  console.log(`Navigating to ${BASE_URL}...`);
  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 60000 });
  } catch (e) {
    console.error(`Error navigating to ${BASE_URL}:`, e);
    await browser.close();
    return;
  }

  const clicksToPerform = 12; // Number of times to click "Next days"
  const nextDaysButtonXPath = '//*[self::button or self::a or self::span][contains(normalize-space(.), "Next days")]';

  console.log(`Attempting to click "Next days" button ${clicksToPerform} times...`);
  for (let i = 0; i < clicksToPerform; i++) {
    try {
      // console.log(`Click ${i + 1}/${clicksToPerform}...`); // Keep logs minimal
      const initialDateCount = await page.evaluate(() => document.querySelectorAll('.calendar-date-wrapper').length);

      const clicked = await page.evaluate((xpath) => {
        const button = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLElement;
        if (button && button.offsetParent !== null) { // Check if visible
          button.click();
          return true;
        }
        return false;
      }, nextDaysButtonXPath);

      if (clicked) {
        await page.waitForFunction(
          (count) => document.querySelectorAll('.calendar-date-wrapper').length > count,
          { timeout: 15000 },
          initialDateCount
        ).catch(() => {
            // console.log(`No new date wrappers appeared after click ${i+1}, or timeout.`); // Minimal log
        });
        // console.log('Clicked "Next days". Pausing for content to render...'); // Minimal log
        await new Promise(resolve => setTimeout(resolve, 1500)); 
      } else {
        console.log('"Next days" button not found or not visible. Assuming no more data to load.');
        break; 
      }
    } catch (e) {
      console.error(`Error during click iteration ${i + 1}:`, e);
      // Optional: Save HTML on error during main fetch if needed for deeper debugging
      // const htmlContent = await page.content();
      // require('fs').writeFileSync(`debug-mainfetch-click-error-iter${i+1}.html`, htmlContent);
      break; 
    }
  }
  console.log('Finished clicking "Next days". Proceeding to extract concert data...');

  // --- Existing concert extraction logic from page.evaluate --- 
  const concerts: Partial<Concert>[] = await page.evaluate(() => {
    const results: Partial<Concert>[] = [];
    const processEventCard = (card: Element, date: string) => {
      const title = (card.querySelector('.EventCard-title')?.textContent || '').trim();
      if (!title) return; // Skip if no title

      const description = (card.querySelector('.EventCard-description p')?.textContent || '').trim();
      const location = (card.querySelector('.EventCard-place')?.textContent || '').trim();
      const defaultImage = "https://philharmoniedeparis.fr/themes/custom/pdp_theme/images/sprite.svg?v1.0#logo-pp-vertical";
      let imageSrc = card.parentElement?.querySelector('.Card-image img')?.getAttribute('src') || '';
      if (imageSrc && !imageSrc.startsWith('http')) {
        imageSrc = `https://philharmoniedeparis.fr${imageSrc}`;
      }
      const image_url = imageSrc || defaultImage;
      const bookingSuffix = card.querySelector('.EventCard-button')?.getAttribute('href') || '';
      const booking_url = bookingSuffix ? `https://philharmoniedeparis.fr${bookingSuffix}` : '';
      const priceNodes = card.querySelectorAll('.Prices-price');
      const prices = Array.from(priceNodes)
        .filter(p => !p.classList.contains('Prices-price--none'))
        .map(p => parseFloat(p.textContent?.replace('€', '').trim() || ''))
        .filter(n => !isNaN(n));
      const availabilityText = (card.querySelector('.event-availabilityAlert')?.textContent || '').toLowerCase();
      const statusText = (card.querySelector('.event-availabilityAlert p')?.textContent || availabilityText).toLowerCase();
      let status: 'available' | 'few_remaining' | 'sold_out' = 'available';
      if (statusText.includes('last tickets') || statusText.includes('last places') || statusText.includes('dernières places')) {
        status = 'few_remaining';
      } else if (statusText.includes('sold out') || statusText.includes('complet')) {
        status = 'sold_out';
      }
      const category = (card.querySelector('.EventCard-category')?.textContent || '')
        .trim()
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n/g, ' ') // Replace newlines with space
        .trim(); // Trim again after replacements
      
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
          program: [],
          musicians: []
        });
      }
    };

    const dateWrappers = document.querySelectorAll('.calendar-date-wrapper');
    dateWrappers.forEach(dateWrapper => {
      const date = (dateWrapper.querySelector('h2.calendar-date')?.textContent || '').trim();
      if (!date) return; // Skip if no date for this wrapper

      // Table view: EventCards directly under the dateWrapper
      dateWrapper.querySelectorAll(':scope > .EventCard, :scope > article.EventCard, :scope > div > .EventCard, :scope > div > article.EventCard').forEach(card => {
        const cardContent = card.querySelector('.EventCard-content');
        if (cardContent) processEventCard(cardContent, date);
      });   
      
      // Agenda view: agenda-event-wrapper siblings
      let next = dateWrapper.nextElementSibling;
      while (next && !next.classList.contains('calendar-date-wrapper')) {
        if (next.classList.contains('agenda-event-wrapper')) {
          next.querySelectorAll('.EventCard').forEach(card => {
            const cardContent = card.querySelector('.EventCard-content');
            if (cardContent) processEventCard(cardContent, date);
          });
        }
        // Check for EventCard-content if it's a direct sibling without agenda-event-wrapper (less common but for safety)
        if (next.querySelector('.EventCard-content')) {
             next.querySelectorAll('.EventCard').forEach(card => { // Assuming EventCard is the parent of EventCard-content
                const cardContent = card.querySelector('.EventCard-content');
                if (cardContent) processEventCard(cardContent, date);
            });
        }
        next = next.nextElementSibling;
      }
    });
    return results;
  });
  // --- End of existing concert extraction logic ---

  console.log(`Found ${concerts.length} initial concert stubs. Starting to fetch program details...`);

  let processedCount = 0;
  let skippedProgramFetchCount = 0;
  let fetchedProgramCount = 0;
  let emptyProgramCount = 0;

  for (let i = 0; i < concerts.length; i++) {
    const concert = concerts[i];
    if (!concert.title || !concert.date || !concert.booking_url) {
      console.log('[Skip] Skipping concert with missing essential data:', concert.title, concert.date);
      continue;
    }

    console.log(`[${i + 1}/${concerts.length}] Processing: ${concert.title}`); // Minimal log

    const needsProgram = !(await checkExistingConcert(concert));
    let skipUpdate = false;
    if (needsProgram) {
      try {
        const { program, musicians } = await fetchProgramDetails(page, concert.booking_url);
        concert.program = program;
        concert.musicians = musicians;
        if (concert.program.length === 0 && concert.musicians.length === 0) {
          console.log(`No program or musicians found for: ${concert.title}`); // Minimal log
          emptyProgramCount++;
        } else {
          fetchedProgramCount++;
        }
      } catch (error) {
        console.error(`Failed to fetch program for concert: ${concert.title}`, error); // Minimal log
        concert.program = [];
        concert.musicians = [];
        emptyProgramCount++;
      }
    } else {
      skipUpdate = true;
      console.log(`[Skip] Skipping program fetch for: ${concert.title} (already exists)`); // Minimal log
      skippedProgramFetchCount++;
      // Do NOT push to concertsToUpsert, so it will not be upserted/overwritten
    }
    processedCount++;
    if (!skipUpdate) {
      await onConcertComplete(concert as Concert);
    }
  }

  console.log('\nScraping completed successfully!');
  console.log('Final Statistics:');
  console.log(`- Total concert stubs found: ${concerts.length}`);
  console.log(`- Concerts processed (saved/updated): ${processedCount}`);
  console.log(`- Program details fetched anew: ${fetchedProgramCount}`);
  console.log(`- Programs/musicians found empty: ${emptyProgramCount}`);
  console.log(`- Program fetch skipped (already exists): ${skippedProgramFetchCount}`);
  
  await browser.close();
}

// ... (keep testFetch as is for now, or remove if no longer needed for this specific issue)
async function testFetch() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36');

  const baseUrlWithoutPage = 'https://philharmoniedeparis.fr/en/calendar?genreGps=2%2B3'; // No &page=30
  console.log(`Navigating to ${baseUrlWithoutPage}...`);
  try {
    await page.goto(baseUrlWithoutPage, { waitUntil: 'networkidle0', timeout: 60000 });
  } catch (e) {
    console.error(`Error navigating to ${baseUrlWithoutPage}:`, e);
    await browser.close();
    return;
  }

  const clicksToPerform = 12; // Approximate clicks for a year, adjust as needed
  const nextDaysButtonXPath = '//*[self::button or self::a or self::span][contains(normalize-space(.), "Next days")]';

  console.log(`Attempting to click "Next days" button ${clicksToPerform} times...`);
  for (let i = 0; i < clicksToPerform; i++) {
    try {
      console.log(`Click ${i + 1}/${clicksToPerform}...`);
      
      const initialDateCount = await page.evaluate(() => document.querySelectorAll('.calendar-date-wrapper').length);

      const clicked = await page.evaluate((xpath) => {
        const button = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLElement;
        if (button && button.offsetParent !== null) { // Check if visible
          button.click();
          return true;
        }
        return false;
      }, nextDaysButtonXPath);

      if (clicked) {
        // Wait for new content to load - either by checking for more date wrappers or a timeout
        await page.waitForFunction(
          (count) => document.querySelectorAll('.calendar-date-wrapper').length > count,
          { timeout: 15000 }, // 15-second timeout for new content
          initialDateCount
        ).catch(() => {
            console.log(`No new date wrappers appeared after click ${i+1}, or timeout. Might be end of data or button not effective.`);
            // We will not break here, to allow further attempts if needed, or to reach the end of clicksToPerform
        });
        
        console.log('Clicked "Next days". Pausing for content to render...');
        await new Promise(resolve => setTimeout(resolve, 1500)); // Small pause for rendering
      } else {
        console.log('"Next days" button not found or not visible. Assuming no more data to load.');
        break; // Exit loop if button isn't found/visible or couldn't be clicked
      }
    } catch (e) {
      console.error(`Error during click iteration ${i + 1}:`, e);
      const htmlContent = await page.content();
      writeFileSync(`debug-click-error-iter${i+1}.html`, htmlContent);
      break; // Stop if there's an error during the process
    }
  }
  
  console.log('Finished clicking "Next days". Saving final page content...');
  const finalHtml = await page.content();
  writeFileSync('debug-after-all-clicks.html', finalHtml);
  console.log('Saved final page HTML to debug-after-all-clicks.html');

  // Now try to find all date wrappers
  console.log('Attempting to extract all .calendar-date-wrapper h2.calendar-date elements...');
  const allDates = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.calendar-date-wrapper h2.calendar-date'))
      .map(el => el.textContent?.trim());
  });

  console.log('All date wrappers found by page.evaluate:');
  if (allDates.length === 0) {
    console.log('No date wrappers found by page.evaluate. Check debug-after-all-clicks.html.');
  }
  allDates.forEach(date => console.log(date));
  
  // Specifically check for the target date
  if (allDates.includes("Sunday, 9 November 2025")) {
    console.log("SUCCESS: Found 'Sunday, 9 November 2025' in the list!");
  } else {
    console.log("FAILURE: 'Sunday, 9 November 2025' was NOT found in the list after clicks.");
  }

  await browser.close();
}

export { fetchConcerts, testFetch };