import React from 'react';

interface ConcertTableProps {
  concerts: {
    title: string;
    description: string;
    location: string;
    image_url: string;
    booking_url: string;
    prices: number[];
    date: string;
    category: string;
  }[];
}

export default function ConcertTable({ concerts }: ConcertTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-cream border border-blue rounded-lg">
        <thead>
          <tr className="bg-blue text-navy">
            <th className="p-2">Image</th>
            <th className="p-2">Title</th>
            <th className="p-2">Category</th>
            <th className="p-2">Location</th>
            <th className="p-2">Date</th>
            <th className="p-2">Prices (€)</th>
            <th className="p-2">Booking</th>
          </tr>
        </thead>
        <tbody>
          {concerts.map((concert, idx) => (
            <tr key={idx} className="border-t border-blue hover:bg-pink/10">
              <td className="p-2">
                <img
                  src={concert.image_url}
                  alt={concert.title}
                  className="w-24 h-16 object-cover rounded border border-pink"
                />
              </td>
              <td className="p-2 font-semibold text-navy">{concert.title}</td>
              <td className="p-2 text-blue">{concert.category}</td>
              <td className="p-2 text-navy">{concert.location}</td>
              <td className="p-2 text-navy">{new Date(concert.date).toLocaleString()}</td>
              <td className="p-2 text-blue">{concert.prices.join(', ')}</td>
              <td className="p-2">
                <a
                  href={concert.booking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-pink text-navy font-semibold px-3 py-1 rounded hover:bg-blue hover:text-cream transition"
                >
                  Book
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 