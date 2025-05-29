import React from 'react';

interface ConcertCardProps {
  concert: {
    title: string;
    description: string;
    location: string;
    image_url: string;
    booking_url: string;
    prices: number[];
    date: string;
    category: string;
  };
}

export default function ConcertCard({ concert }: ConcertCardProps) {
  return (
    <div className="bg-cream rounded-lg shadow-md p-4 flex flex-col h-full border border-blue">
      <img
        src={concert.image_url}
        alt={concert.title}
        className="w-full h-48 object-cover rounded mb-4 border border-pink"
      />
      <div className="flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-navy mb-1">{concert.title}</h3>
        <div className="text-blue text-xs mb-1">{concert.category}</div>
        <div className="text-sm text-navy mb-2">{concert.location}</div>
        <div className="text-xs text-navy mb-2">
          {concert.date.slice(0, 10)} {concert.date.slice(11, 16)}
        </div>
        <p className="text-sm text-navy mb-2 line-clamp-3">{concert.description}</p>
        <div className="mt-auto flex flex-col gap-2">
          {concert.prices.length > 0 && (
            <div className="text-xs text-blue">Prices: {concert.prices.join(', ')} €</div>
          )}
          <a
            href={concert.booking_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-pink text-navy font-semibold px-3 py-1 rounded hover:bg-blue hover:text-cream transition"
          >
            Book
          </a>
        </div>
      </div>
    </div>
  );
} 