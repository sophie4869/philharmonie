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

export default function ConcertTable({ concerts, palette = 'blue' }: ConcertTableProps & { palette?: 'blue' | 'peach' }) {
  return (
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
            <th className="p-2 text-base font-semibold font-sans">Booking</th>
          </tr>
        </thead>
        <tbody>
          {concerts.map((concert, idx) => (
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
              <td className={`p-2 font-sans ${palette === 'blue' ? 'text-bluecardpara' : 'text-peachcardpara'}`}>{new Date(concert.date).toLocaleString()}</td>
              <td className={`p-2 font-sans ${palette === 'blue' ? 'text-bluecardpara' : 'text-peachcardpara'}`}>{concert.prices.join(', ')}</td>
              <td className="p-2">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 