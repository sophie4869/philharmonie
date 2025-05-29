import React, { useEffect, useState } from 'react';
import { ProgramItem } from '../utils/scraping';

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
  }[];
  palette?: 'blue' | 'peach';
}

export default function ConcertTable({ concerts, palette = 'blue' }: ConcertTableProps) {
  const [futureConcerts, setFutureConcerts] = useState<typeof concerts>([]);
  const [selectedConcert, setSelectedConcert] = useState<typeof concerts[0] | null>(null);

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
      <div className="overflow-x-auto">
        <table className={`min-w-full rounded-lg font-sans border-2 ${palette === 'blue' ? 'bg-bluecard border-blueheadline' : 'bg-peachcard border-peachheadline'}`}>
          <thead>
            <tr className={`${palette === 'blue' ? 'bg-blueheadline text-bluehighlight' : 'bg-peachheadline text-peachhighlight'} font-sans`}>
              <th className="p-2 text-base font-semibold font-sans">Image</th>
              <th className="p-2 text-base font-semibold font-sans">Title</th>
              <th className="p-2 text-base font-semibold font-sans">Category</th>
              <th className="p-2 text-base font-semibold font-sans">Location</th>
              <th className="p-2 text-base font-semibold font-sans">Date</th>
              <th className="p-2 text-base font-semibold font-sans">Prices (€)</th>
              <th className="p-2 text-base font-semibold font-sans">Actions</th>
            </tr>
          </thead>
          <tbody>
            {futureConcerts.map((concert, idx) => (
              <tr key={idx} className={`font-sans border-t ${palette === 'blue' ? 'border-blueheadline hover:bg-bluesecondary/10' : 'border-peachheadline hover:bg-peachsecondary/10'}`}>
                <td className="p-2">
                  <img
                    src={concert.image_url}
                    alt={concert.title}
                    className={`w-24 h-16 object-cover rounded border-2 ${palette === 'blue' ? 'border-blueheadline' : 'border-peachheadline'}`}
                  />
                </td>
                <td className={`p-2 font-semibold font-sans ${palette === 'blue' ? 'text-bluecardheading' : 'text-peachcardheading'}`}>{concert.title}</td>
                <td className={`p-2 font-sans ${palette === 'blue' ? 'text-bluecardheading' : 'text-peachcardheading'}`}>{concert.category}</td>
                <td className={`p-2 font-sans ${palette === 'blue' ? 'text-bluecardpara' : 'text-peachcardpara'}`}>{concert.location}</td>
                <td className={`p-2 font-sans ${palette === 'blue' ? 'text-bluecardpara' : 'text-peachcardpara'}`}>{new Date(concert.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                <td className={`p-2 font-sans ${palette === 'blue' ? 'text-bluecardpara' : 'text-peachcardpara'}`}>{concert.prices.join(', ')}</td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <a
                      href={concert.booking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-block font-semibold text-base font-sans px-3 py-1 rounded border-2 transition ${
                        palette === 'blue'
                          ? 'border-blueheadline bg-bluehighlight text-blueheadline hover:bg-blueheadline hover:text-bluehighlight'
                          : 'border-peachheadline bg-peachhighlight text-peachheadline hover:bg-peachheadline hover:text-peachhighlight'
                      }`}
                    >
                      Book
                    </a>
                    <button
                      onClick={() => setSelectedConcert(concert)}
                      className={`inline-block font-semibold text-base font-sans px-3 py-1 rounded border-2 transition ${
                        palette === 'blue'
                          ? 'border-blueheadline bg-bluehighlight text-blueheadline hover:bg-blueheadline hover:text-bluehighlight'
                          : 'border-peachheadline bg-peachhighlight text-peachheadline hover:bg-peachheadline hover:text-peachhighlight'
                      }`}
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
              Program: {selectedConcert.title}
            </h2>
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