import React, { useState } from 'react';
import { ProgramItem, Musician } from '../utils/scraping';
import { PALETTE_CONFIG } from './PaletteWrapper';
import Image from 'next/image';

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
    musicians: Musician[];
  };
  palette: 'blue' | 'peach';
}

export default function ConcertCard({ concert, palette }: ConcertCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const paletteClasses = PALETTE_CONFIG[palette] || PALETTE_CONFIG.blue;

  return (
    <div className="relative h-full min-h-[550px] perspective-1000">
      <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        {/* Front of card */}
        <div className={`absolute w-full h-full backface-hidden rounded-lg shadow-md p-4 flex flex-col border-2 font-sans ${
          palette === 'blue'
            ? 'bg-bluecard border-blueheadline'
            : 'bg-peachcard border-peachheadline'
        }`}>
          <Image 
            src={concert.image_url} 
            alt={concert.title}
            width={300}
            height={200}
            className="w-full h-48 object-cover"
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
                  className={`flex-1 text-center font-semibold text-base font-sans px-3 py-1 rounded border-2 transition ${paletteClasses.button}`}
                >
                  Book
                </a>
                <button
                  onClick={() => setIsFlipped(true)}
                  className={`flex-1 font-semibold text-base font-sans px-3 py-1 rounded border-2 transition ${paletteClasses.button}`}
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
            {concert.musicians.length > 0 && (
              <>
                <h3 className={`text-lg font-bold mb-2 font-sans ${palette === 'blue' ? 'text-bluecardheading' : 'text-peachcardheading'}`}>Musicians</h3>
                <div className="space-y-2 mb-4 overflow-y-auto" style={{ maxHeight: '120px' }}>
                  {concert.musicians.map((musician, index) => (
                    <div key={index} className={`text-sm ${palette === 'blue' ? 'text-bluecardpara' : 'text-peachcardpara'}`}>
                      <span className="font-semibold">{musician.name}</span>
                      {musician.role && <span className="italic">, {musician.role}</span>}
                    </div>
                  ))}
                </div>
              </>
            )}
            <h3 className={`text-lg font-bold mb-2 font-sans ${palette === 'blue' ? 'text-bluecardheading' : 'text-peachcardheading'}`}>Program</h3>
            {concert.program.length > 0 ? (
              <div className="space-y-4 overflow-y-auto" style={{ maxHeight: '200px' }}>
                {concert.program.map((item, index) => (
                  <div key={index} className="mb-4">
                    {item.isIntermission ? (
                      <div className={`text-sm font-semibold ${palette === 'blue' ? 'text-bluecardpara' : 'text-peachcardpara'}`}>{item.title}</div>
                    ) : (
                      <>
                        {item.composer && (
                          <div className={`text-sm font-semibold ${palette === 'blue' ? 'text-bluecardheading' : 'text-peachcardheading'}`}>{item.composer}</div>
                        )}
                        <div className={`text-sm ${palette === 'blue' ? 'text-bluecardpara' : 'text-peachcardpara'}`}>{item.title}</div>
                        {item.details && (
                          <div className={`text-xs italic ${palette === 'blue' ? 'text-bluecardpara' : 'text-peachcardpara'}`}>{item.details}</div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-sm ${palette === 'blue' ? 'text-bluecardpara' : 'text-peachcardpara'}`}>Program not yet available</div>
            )}
            <button
              onClick={() => setIsFlipped(false)}
              className={`mt-auto font-semibold text-base font-sans px-3 py-1 rounded border-2 transition ${paletteClasses.button}`}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 