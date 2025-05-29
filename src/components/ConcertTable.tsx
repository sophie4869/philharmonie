import React, { useEffect, useState } from 'react';
import { ProgramItem, Musician } from '../utils/scraping';
import { PALETTE_CONFIG } from './PaletteWrapper';

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
    program: ProgramItem[];
    musicians: Musician[];
  }[];
  palette?: 'blue' | 'peach';
}

// Helper function to get last names
function getLastName(fullName: string): string {
  const parts = fullName.split(' ');
  return parts[parts.length - 1];
}

// Helper function to check if a musician is a person
function isPersonMusician(name: string): boolean {
  // Exclude names with d', de, or only one word not capitalized
  if (/\bd['’]?( |$)/i.test(name) || /\bde( |$)/i.test(name)) return false;
  const parts = name.trim().split(' ');
  if (parts.length === 1 && name[0] === name[0].toLowerCase()) return false;
  // Exclude names that are all lowercase or all uppercase
  if (name === name.toLowerCase() || name === name.toUpperCase()) return false;
  // Exclude names with numbers
  if (/\d/.test(name)) return false;
  return true;
}

// Helper function to get last names of composers, with exceptions
const composerExceptions = [
  'Clara Schumann',
  'Fanny Mendelssohn',
  'Carl Philipp Emanuel Bach',
  'Richard Strauss',
  'Johann Strauss',
];

function getComposerLastName(composer: string): string {
  if (!composer) return '';
  if (composerExceptions.includes(composer)) return composer;
  const parts = composer.split(' ');
  return parts[parts.length - 1];
}

function getComposerSummary(program: ProgramItem[]): string {
  const composers = new Set(program.map(item => item.composer).filter(Boolean));
  return Array.from(composers).map(getComposerLastName).join(', ');
}

function getMusicianSummary(musicians: Musician[]): string {
  return musicians.filter(m => isPersonMusician(m.name)).map(m => getLastName(m.name)).join(', ');
}

export default function ConcertTable({ concerts, palette = 'blue' }: ConcertTableProps) {
  const [futureConcerts, setFutureConcerts] = useState<typeof concerts>([]);
  const [selectedConcert, setSelectedConcert] = useState<typeof concerts[0] | null>(null);
  const paletteClasses = PALETTE_CONFIG[palette] || PALETTE_CONFIG.blue;

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const filteredAndSorted = concerts
      .filter(concert => {
        const concertDate = new Date(concert.date);
        return concertDate >= today;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setFutureConcerts(filteredAndSorted);
  }, [concerts]);

  return (
    <>
      <div className={`overflow-x-auto border-2 rounded-lg ${paletteClasses.border} bg-transparent`}>
        <table className={`min-w-full rounded-lg font-sans border-2 ${paletteClasses.border} bg-white overflow-hidden`}>
          <thead>
            <tr className={`${paletteClasses.tableHeader} font-sans`}>
              <th className="p-2 text-base font-semibold font-sans rounded-tl-lg w-24">Image</th>
              <th className="p-2 text-base font-semibold font-sans">Title</th>
              <th className="p-2 text-base font-semibold font-sans">Date</th>
              <th className="p-2 text-base font-semibold font-sans min-w-[200px]">Composers</th>
              <th className="p-2 text-base font-semibold font-sans min-w-[200px]">Musicians</th>
              <th className="p-2 text-base font-semibold font-sans">Prices (€)</th>
              <th className="p-2 text-base font-semibold font-sans rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {futureConcerts.map((concert, idx) => (
              <tr key={idx} className={`font-sans border-t ${paletteClasses.border} hover:bg-opacity-10 ${palette === 'blue' ? 'hover:bg-bluesecondary' : 'hover:bg-peachsecondary'} ${idx === 0 ? 'first:rounded-t-lg' : ''} ${idx === futureConcerts.length - 1 ? 'last:rounded-b-lg' : ''}`}>
                <td className="p-2 rounded-l-lg">
                  <img
                    src={concert.image_url}
                    alt={concert.title}
                    className={`w-24 h-16 object-cover rounded border-2 ${paletteClasses.border}`}
                  />
                </td>
                <td className={`p-2 font-semibold font-sans ${palette === 'blue' ? 'text-bluecardheading' : 'text-peachcardheading'}`}>{concert.title}</td>
                <td className={`p-2 font-sans ${palette === 'blue' ? 'text-bluecardpara' : 'text-peachcardpara'}`}>{new Date(concert.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                <td className={`p-2 font-sans ${palette === 'blue' ? 'text-bluecardpara' : 'text-peachcardpara'} min-w-[200px]`}>{getComposerSummary(concert.program)}</td>
                <td className={`p-2 font-sans ${palette === 'blue' ? 'text-bluecardpara' : 'text-peachcardpara'} min-w-[200px]`}>{getMusicianSummary(concert.musicians)}</td>
                <td className={`p-2 font-sans ${palette === 'blue' ? 'text-bluecardpara' : 'text-peachcardpara'}`}>{concert.prices.join(', ')}</td>
                <td className="p-2 rounded-r-lg">
                  <div className="flex gap-2">
                    <a
                      href={concert.booking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-block font-semibold text-base font-sans px-3 py-1 rounded border-2 transition ${paletteClasses.button}`}
                    >
                      Book
                    </a>
                    <button
                      onClick={() => setSelectedConcert(concert)}
                      className={`inline-block font-semibold text-base font-sans px-3 py-1 rounded border-2 transition ${paletteClasses.button}`}
                    >
                      Program
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Program Modal */}
      {selectedConcert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`relative max-w-2xl w-full rounded-lg shadow-lg p-6 ${
            palette === 'blue' ? 'bg-bluecard' : 'bg-peachcard'
          }`}>
            <button
              onClick={() => setSelectedConcert(null)}
              className={`absolute top-4 right-4 text-2xl font-bold ${
                palette === 'blue' ? 'text-blueheadline' : 'text-peachheadline'
              }`}
            >
              ×
            </button>
            <h2 className={`text-xl font-bold mb-4 ${palette === 'blue' ? 'text-bluecardheading' : 'text-peachcardheading'}`}>
              {selectedConcert.title}
            </h2>
            {selectedConcert.musicians.length > 0 && (
              <>
                <h3 className={`text-lg font-bold mb-2 ${palette === 'blue' ? 'text-bluecardheading' : 'text-peachcardheading'}`}>Musicians</h3>
                <div className="space-y-2 mb-4">
                  {selectedConcert.musicians.map((musician, index) => (
                    <div key={index} className={`text-sm ${palette === 'blue' ? 'text-bluecardpara' : 'text-peachcardpara'}`}>
                      <span className="font-semibold">{musician.name}</span>
                      {musician.role && <span className="italic">, {musician.role}</span>}
                    </div>
                  ))}
                </div>
              </>
            )}
            <h3 className={`text-lg font-bold mb-2 ${palette === 'blue' ? 'text-bluecardheading' : 'text-peachcardheading'}`}>Program</h3>
            {selectedConcert.program.length > 0 ? (
              <div className="space-y-4">
                {selectedConcert.program.map((item, index) => (
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
          </div>
        </div>
      )}
    </>
  );
} 