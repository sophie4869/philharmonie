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
            Name: 'Philharmonie',
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
    <h2>New Concert Alert!</h2>
    <p>A new concert featuring ${musicianName} has been announced:</p>
    <div>
      <h3>${concert.title}</h3>
      <p>Date: ${new Date(concert.date).toLocaleDateString()}</p>
      <p>Location: ${concert.location}</p>
      <p><a href="${concert.booking_url}">Book Tickets Now</a></p>
    </div>
  `;

  try {
    await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: process.env.EMAIL_FROM,
            Name: 'Philharmonie',
          },
          To: [
            {
              Email: email,
              Name: email.split('@')[0],
            },
          ],
          Subject: `New Concert Alert: ${concert.title}`,
          HTMLPart: emailContent,
        },
      ],
    });
  } catch (error) {
    console.error('Error sending alert email:', error);
    throw error;
  }
} 