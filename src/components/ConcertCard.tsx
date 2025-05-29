import React, { useState } from 'react';
import { ProgramItem } from '../utils/scraping';

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
    program: ProgramItem[];
  };
  palette: 'blue' | 'peach';
}

export default function ConcertCard({ concert, palette }: ConcertCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="relative h-full min-h-[500px] perspective-1000">
      <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        {/* Front of card */}
        <div className={`absolute w-full h-full backface-hidden rounded-lg shadow-md p-4 flex flex-col border-2 font-sans ${
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
              <div className="flex gap-2">
                <a
                  href={concert.booking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex-1 text-center font-semibold text-base font-sans px-3 py-1 rounded border-2 transition ${
                    palette === 'blue'
                      ? 'bg-bluehighlight text-blueheadline border-blueheadline hover:bg-blueheadline hover:text-bluehighlight'
                      : 'bg-peachhighlight text-peachheadline border-peachheadline hover:bg-peachheadline hover:text-peachhighlight'
                  }`}
                >
                  Book
                </a>
                <button
                  onClick={() => setIsFlipped(true)}
                  className={`flex-1 font-semibold text-base font-sans px-3 py-1 rounded border-2 transition ${
                    palette === 'blue'
                      ? 'bg-bluehighlight text-blueheadline border-blueheadline hover:bg-blueheadline hover:text-bluehighlight'
                      : 'bg-peachhighlight text-peachheadline border-peachheadline hover:bg-peachheadline hover:text-peachhighlight'
                  }`}
                >
                  Program
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Back of card (Program) */}
        <div className={`absolute w-full h-full backface-hidden rounded-lg shadow-md p-4 flex flex-col border-2 font-sans rotate-y-180 ${
          palette === 'blue'
            ? 'bg-bluecard border-blueheadline'
            : 'bg-peachcard border-peachheadline'
        }`}>
          <div className="flex-1 flex flex-col">
            <h3 className={`text-lg font-bold mb-4 font-sans ${palette === 'blue' ? 'text-bluecardheading' : 'text-peachcardheading'}`}>Program</h3>
            {concert.program.length > 0 ? (
              <div className="space-y-4">
                {concert.program.map((item, index) => (
                  <div key={index} className="mb-4">
                    {item.isIntermission ? (
                      <div className={`text-sm font-semibold ${palette === 'blue' ? 'text-bluecardpara' : 'text-peachcardpara'}`}>
                        {item.title}
                      </div>
                    ) : (
                      <>
                        {item.composer && (
                          <div className={`text-sm font-semibold ${palette === 'blue' ? 'text-bluecardheading' : 'text-peachcardheading'}`}>
                            {item.composer}
                          </div>
                        )}
                        <div className={`text-sm ${palette === 'blue' ? 'text-bluecardpara' : 'text-peachcardpara'}`}>
                          {item.title}
                        </div>
                        {item.details && (
                          <div className={`text-xs italic ${palette === 'blue' ? 'text-bluecardpara' : 'text-peachcardpara'}`}>
                            {item.details}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-sm ${palette === 'blue' ? 'text-bluecardpara' : 'text-peachcardpara'}`}>
                Program not yet available
              </div>
            )}
            <button
              onClick={() => setIsFlipped(false)}
              className={`mt-auto font-semibold text-base font-sans px-3 py-1 rounded border-2 transition ${
                palette === 'blue'
                  ? 'bg-bluehighlight text-blueheadline border-blueheadline hover:bg-blueheadline hover:text-bluehighlight'
                  : 'bg-peachhighlight text-peachheadline border-peachheadline hover:bg-peachheadline hover:text-peachhighlight'
              }`}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 