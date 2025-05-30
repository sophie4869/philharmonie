import React from 'react';
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
  isFlipped: boolean;
  onSetFlip: (flipped: boolean) => void;
}

export default function ConcertCard({ concert, palette, isFlipped, onSetFlip }: ConcertCardProps) {
  const paletteClasses = PALETTE_CONFIG[palette] || PALETTE_CONFIG.blue;

  function formatConcertDate(dateString: string) {
    const date = new Date(dateString);
    // Example: Monday, June 2 or Wednesday, 4 Jun
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  }

  return (
    <div className="relative h-full min-h-[550px] perspective-1000">
      <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        {/* Front of card */}
        <div className={`absolute w-full h-full backface-hidden rounded-lg shadow-md p-4 flex flex-col border-2 font-sans ${paletteClasses.card} ${paletteClasses.border}`}>
          <Image 
            src={concert.image_url} 
            alt={concert.title}
            width={300}
            height={200}
            className="w-full h-48 object-cover"
          />
          <div className="flex-1 flex flex-col">
            <h3 className={`text-lg font-bold mb-1 font-sans ${paletteClasses.cardheading}`}>{concert.title}</h3>
            <div className={`text-base font-semibold mb-1 font-sans ${paletteClasses.cardheading}`}>{concert.category}</div>
            <div className={`text-[15px] font-medium mb-1 font-sans tracking-wide ${paletteClasses.cardpara}`}>{concert.location}</div>
            <div className={`text-xs font-light italic mb-2 font-sans ${paletteClasses.cardpara}`}>
              {formatConcertDate(concert.date)}
            </div>
            <p className={`text-sm font-normal mb-2 line-clamp-3 font-sans leading-relaxed ${paletteClasses.cardpara}`}>{concert.description}</p>
            <div className="mt-auto flex flex-col gap-2">
              {concert.prices.length > 0 && (
                <div className={`text-xs font-sans ${paletteClasses.cardpara}`}>Prices: {concert.prices.join(', ')} €</div>
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
                  onClick={() => onSetFlip(true)}
                  className={`flex-1 font-semibold text-base font-sans px-3 py-1 rounded border-2 transition ${paletteClasses.button}`}
                >
                  Program
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Back of card (Program) */}
        <div className={`absolute w-full h-full backface-hidden rounded-lg shadow-md p-4 flex flex-col border-2 font-sans rotate-y-180 ${paletteClasses.card} ${paletteClasses.border}`}>
          <div className="flex-1 flex flex-col">
            {concert.musicians.length > 0 && (
              <>
                <h3 className={`text-lg font-bold mb-2 font-sans ${paletteClasses.cardheading}`}>Musicians</h3>
                <div className="space-y-2 mb-4 overflow-y-auto" style={{ maxHeight: '120px' }}>
                  {concert.musicians.map((musician, index) => (
                    <div key={index} className={`text-sm ${paletteClasses.cardpara}`}>
                      <span className="font-semibold">{musician.name}</span>
                      {musician.role && <span className="italic">, {musician.role}</span>}
                    </div>
                  ))}
                </div>
              </>
            )}
            <h3 className={`text-lg font-bold mb-2 font-sans ${paletteClasses.cardheading}`}>Program</h3>
            {concert.program.length > 0 ? (
              <div className="space-y-4 overflow-y-auto" style={{ maxHeight: '200px' }}>
                {concert.program.map((item, index) => (
                  <div key={index} className="mb-4">
                    {item.isIntermission ? (
                      <div className={`text-sm font-semibold ${paletteClasses.cardpara}`}>{item.title}</div>
                    ) : (
                      <>
                        {item.composer && (
                          <div className={`text-sm font-semibold ${paletteClasses.cardheading}`}>{item.composer}</div>
                        )}
                        <div className={`text-sm ${paletteClasses.cardpara}`}>{item.title}</div>
                        {item.details && (
                          <div className={`text-xs italic ${paletteClasses.cardpara}`}>{item.details}</div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-sm ${paletteClasses.cardpara}`}>Program not yet available</div>
            )}
            <div className="mt-auto flex gap-2">
              <a
                href={concert.booking_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 text-center font-semibold text-base font-sans px-3 py-1 rounded border-2 transition ${paletteClasses.button}`}
              >
                Book
              </a>
              <button
                onClick={() => onSetFlip(false)}
                className={`flex-1 font-semibold text-base font-sans px-3 py-1 rounded border-2 transition ${paletteClasses.button}`}
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 