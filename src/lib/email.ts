import Mailjet from 'node-mailjet';
import { Concert } from './types';

const mailjet = new Mailjet({
  apiKey: process.env.MAILJET_API_KEY || '',
  apiSecret: process.env.MAILJET_API_SECRET || '',
});

export async function sendMusicianDigest(
  email: string,
  musicianName: string,
  concerts: Concert[]
) {
  const concertsList = concerts
    .map(
      (concert) => `
        <li>
          <strong>${concert.title}</strong><br>
          Date: ${new Date(concert.date).toLocaleDateString()}<br>
          Location: ${concert.location}<br>
          <a href="${concert.booking_url}">Book Tickets</a>
        </li>
      `
    )
    .join('');

  const emailContent = `
    <h2>Upcoming Concerts featuring ${musicianName}</h2>
    <ul>
      ${concertsList}
    </ul>
  `;

  try {
    await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: process.env.EMAIL_FROM,
            Name: 'Concert Alerts from Sophie',
          },
          To: [
            {
              Email: email,
              Name: email.split('@')[0],
            },
          ],
          Subject: `Upcoming Concerts: ${musicianName}`,
          HTMLPart: emailContent,
        },
      ],
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function sendAlert(
  email: string,
  musicianName: string,
  concert: Concert
) {
  const emailContent = `
    <h2>New Concert Alert for ${musicianName}!</h2>
    <p>A new concert featuring ${musicianName} has been announced:</p>
    <div>
      <h3>${concert.title}</h3>
      ${concert.image_url ? `<img src="${concert.image_url}" alt="${concert.title}" style="max-width:200px;height:auto;margin-bottom:16px;border-radius:8px;" />` : ''}<br>
      <p>Date: ${new Date(concert.date).toLocaleDateString()}</p>
      <p>Location: ${concert.location}</p>
      ${concert.program && concert.program.length > 0 ? `
        <div>
          <strong>Program:</strong>
          <ul>
            ${concert.program.map(piece => `<li>${piece.title}${piece.composer ? ` by ${piece.composer}` : ''}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      <p><a href="${concert.booking_url}">Book Tickets Now</a></p>
    </div>
  `;

  try {
    await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: process.env.EMAIL_FROM,
            Name: 'Concert Alerts from Sophie',
          },
          To: [
            {
              Email: email,
              Name: email.split('@')[0],
            },
          ],
          Subject: `New Concert Alert for ${musicianName}!`,
          HTMLPart: emailContent,
        },
      ],
    });
  } catch (error) {
    console.error('Error sending alert email:', error);
    throw error;
  }
}

export async function sendPreferencesUpdateEmail(email: string, preferences: { digestFrequency: string, subscribedMusicians: { name: string, role?: string }[] }) {
  const { digestFrequency, subscribedMusicians } = preferences;
  const emailContent = `
    <h2>Your Email Preferences Have Been Updated</h2>
    <p>Thank you for updating your email preferences. Here are your current settings:</p>
    <ul>
      <li><strong>Digest Frequency:</strong> ${digestFrequency}</li>
      <li><strong>Subscribed Musicians:</strong>
        <ul>
          ${subscribedMusicians.length > 0 ? subscribedMusicians.map(m => `<li>${m.name}${m.role ? ` (${m.role})` : ''}</li>`).join('') : '<li>None</li>'}
        </ul>
      </li>
    </ul>
    <p>You will receive updates according to these preferences.</p>
  `;
  try {
    await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: process.env.EMAIL_FROM,
            Name: 'Concert Alerts from Sophie',
          },
          To: [
            {
              Email: email,
              Name: email.split('@')[0],
            },
          ],
          Subject: 'Your Email Preferences Have Been Updated',
          HTMLPart: emailContent,
        },
      ],
    });
  } catch (error) {
    console.error('Error sending preferences update email:', error);
    throw error;
  }
}

export async function sendDigestForAllMusicians(
  email: string,
  musicianConcerts: { musician: string, concerts: Concert[] }[]
) {
  const emailContent = musicianConcerts
    .map(({ musician, concerts }) => `
      <h3>${musician}</h3>
      <ul>
        ${concerts.length > 0
          ? concerts.map(concert => `
            <li style="margin-bottom: 24px;">
              <strong>${concert.title}</strong><br>
              ${concert.image_url ? `<img src="${concert.image_url}" alt="${concert.title}" style="max-width:200px;height:auto;margin:8px 0 8px 0;border-radius:8px;" />` : ''}<br>
              Date: ${new Date(concert.date).toLocaleDateString()}<br>
              Location: ${concert.location}<br>
              ${concert.program && concert.program.length > 0 ? `
                <div>
                  <strong>Program:</strong>
                  <ul>
                    ${concert.program.map(piece => `<li>${piece.title}${piece.composer ? ` by ${piece.composer}` : ''}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              <a href="${concert.booking_url}">Book Tickets</a>
            </li>
          `).join('')
          : '<li>No upcoming concerts.</li>'
        }
      </ul>
    `).join('');

  try {
    await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: process.env.EMAIL_FROM,
            Name: 'Concert Alerts from Sophie',
          },
          To: [
            {
              Email: email,
              Name: email.split('@')[0],
            },
          ],
          Subject: `Upcoming Concerts Digest`,
          HTMLPart: `<h2>Your Upcoming Concerts Digest</h2>${emailContent}`,
        },
      ],
    });
  } catch (error) {
    console.error('Error sending digest email:', error);
    throw error;
  }
} 