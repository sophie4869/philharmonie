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
  palette: 'blue' | 'peach';
}

export default function ConcertCard({ concert, palette }: ConcertCardProps) {
  return (
    <div className={`rounded-lg shadow-md p-4 flex flex-col h-full border-2 font-sans ${
      palette === 'blue'
        ? 'bg-bluecard border-blueheadline'
        : 'bg-peachcard border-peachheadline'
    }`}>
      <img
        src={concert.image_url}
        alt={concert.title}
        className={`w-full h-48 object-cover rounded mb-4 border-2 ${palette === 'blue' ? 'border-blueheadline' : 'border-peachheadline'}`}
      />
      <div className="flex-1 flex flex-col">
        <h3 className={`text-lg font-bold mb-1 font-sans ${palette === 'blue' ? 'text-bluecardheading' : 'text-peachcardheading'}`}>{concert.title}</h3>
        <div className={`text-base font-semibold mb-1 font-sans ${palette === 'blue' ? 'text-bluecardheading' : 'text-peachcardheading'}`}>{concert.category}</div>
        <div className={`text-sm font-sans mb-2 ${palette === 'blue' ? 'text-bluecardpara' : 'text-peachcardpara'}`}>{concert.location}</div>
        <div className={`text-xs font-sans mb-2 ${palette === 'blue' ? 'text-bluecardpara' : 'text-peachcardpara'}`}>{concert.date.slice(0, 10)} {concert.date.slice(11, 16)}</div>
        <p className={`text-sm font-sans mb-2 line-clamp-3 ${palette === 'blue' ? 'text-bluecardpara' : 'text-peachcardpara'}`}>{concert.description}</p>
        <div className="mt-auto flex flex-col gap-2">
          {concert.prices.length > 0 && (
            <div className={`text-xs font-sans ${palette === 'blue' ? 'text-bluecardpara' : 'text-peachcardpara'}`}>Prices: {concert.prices.join(', ')} €</div>
          )}
          <a
            href={concert.booking_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-block font-semibold text-base font-sans px-3 py-1 rounded border-2 transition ${
              palette === 'blue'
                ? 'bg-bluehighlight text-blueheadline border-blueheadline hover:bg-blueheadline hover:text-bluehighlight'
                : 'bg-peachhighlight text-peachheadline border-peachheadline hover:bg-peachheadline hover:text-peachhighlight'
            }`}
          >
            Book
          </a>
        </div>
      </div>
    </div>
  );
} 