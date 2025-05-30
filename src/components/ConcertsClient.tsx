"use client";
import React, { useEffect, useState, useMemo } from "react";
import ConcertCard from "./ConcertCard";
import ConcertTable from "./ConcertTable";
import { PALETTE_CONFIG } from "./PaletteWrapper";
import { generateICS, getCalendarDays } from "../utils/calendar";
import { Concert } from "../lib/types";

export default function ConcertsClient({
    concerts,
    categories,
    palette = 'blue',
    setPalette = () => {},
}: {
    concerts: Concert[];
    categories: string[];
    palette?: 'blue' | 'peach';
    setPalette?: (p: 'blue' | 'peach') => void;
}) {
    const [view, setView] = useState<"card" | "table" | "calendar">("card");
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [composer, setComposer] = useState("");
    const [musician, setMusician] = useState("");
    const [showComposerSuggestions, setShowComposerSuggestions] = useState(false);
    const [showMusicianSuggestions, setShowMusicianSuggestions] = useState(false);
    const [showContact, setShowContact] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        // Set initial view from localStorage on client mount
        const storedView = localStorage.getItem("concertsView") as "card" | "table" | "calendar";
        if (storedView) {
            setView(storedView);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("concertsView", view);
    }, [view]);

    // Only show future concerts
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureConcerts = concerts.filter(c => {
        const concertDate = new Date(c.date);
        return concertDate >= today;
    });

    // Extract unique composers, musicians
    const composerOptions = useMemo(() => {
        const set = new Set<string>();
        futureConcerts.forEach(c => c.program.forEach(item => {
            if (item.composer) set.add(item.composer);
        }));
        return Array.from(set).sort();
    }, [futureConcerts]);
    const musicianOptions = useMemo(() => {
        const set = new Set<string>();
        futureConcerts.forEach(c => c.musicians.forEach(m => {
            if (m.name) set.add(m.name);
        }));
        return Array.from(set).sort();
    }, [futureConcerts]);

    // DEBUG: Log selected category whenever it changes
    useEffect(() => {
        console.log("Selected category:", category);
    }, [category]);

    console.log("Future concert categories:", futureConcerts.map(c => c.category));

    const filtered = futureConcerts.filter((c) => {
        // DEBUG: Log each comparison
        if (category) {
            console.log("Filtering concert category:", c.category, "against selected:", category);
        }
        // Split search terms and convert to lowercase
        const searchTerms = search.toLowerCase().split(/\s+/).filter(term => term.length > 0);

        // Check if all search terms match anywhere in the concert data
        const matchesSearch = searchTerms.length === 0 || searchTerms.every(term => {
            // Check title, description, and location
            const basicMatch = 
                c.title.toLowerCase().includes(term) ||
                c.description.toLowerCase().includes(term) ||
                c.location.toLowerCase().includes(term);

            // Check program items
            const programMatch = c.program.some(item => 
                item.title.toLowerCase().includes(term) ||
                (item.composer?.toLowerCase().includes(term) ?? false) ||
                (item.details?.toLowerCase().includes(term) ?? false)
            );

            // Check musicians
            const musicianMatch = c.musicians.some(m => 
                m.name.toLowerCase().includes(term) ||
                (m.role?.toLowerCase().includes(term) ?? false)
            );

            return basicMatch || programMatch || musicianMatch;
        });

        const matchesCategory = category ? c.category === category : true;
        const matchesComposer = composer ? c.program.some(item => 
            item.composer?.toLowerCase().includes(composer.toLowerCase())
        ) : true;
        const matchesMusician = musician ? c.musicians.some(m => 
            m.name.toLowerCase().includes(musician.toLowerCase())
        ) : true;

        return matchesSearch && matchesCategory && matchesComposer && matchesMusician;
    });

    const paletteKeys = Object.keys(PALETTE_CONFIG);
    const paletteClasses = PALETTE_CONFIG[palette] || PALETTE_CONFIG.blue;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className={`text-3xl font-bold mb-6 font-sans ${paletteClasses.text}`}>Philharmonie de Paris Concerts</h1>
            <div className={`flex flex-col gap-2 mb-6 p-4 rounded-lg border-2 ${paletteClasses.border} bg-cream`}>
                <div className="flex flex-wrap w-full gap-4">
                  <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={`border-2 rounded px-3 py-2 w-full sm:w-48 md:w-56 bg-cream font-sans text-navy focus:outline-none focus:ring-2 ${paletteClasses.border}`}
                  >
                      <option value="">All categories</option>
                      {categories.map((cat) => (
                          <option key={cat} value={cat}>
                              {cat}
                          </option>
                      ))}
                  </select>
                  <input
                      type="text"
                      placeholder="Search program..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className={`border-2 rounded px-3 py-2 flex-1 min-w-[180px] bg-cream font-sans text-navy focus:outline-none focus:ring-2 ${paletteClasses.border}`}
                  />
                </div>
                <div className="flex flex-wrap w-full gap-4">
                  <div className="relative flex-1 min-w-[140px]">
                    <input
                        type="text"
                        placeholder="Filter by composer..."
                        value={composer}
                        onChange={(e) => { setComposer(e.target.value); setShowComposerSuggestions(true); }}
                        onFocus={() => setShowComposerSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowComposerSuggestions(false), 100)}
                        className={`border-2 rounded px-3 py-2 w-full bg-cream font-sans text-navy focus:outline-none focus:ring-2 ${paletteClasses.border}`}
                    />
                    {showComposerSuggestions && composer && (
                      <ul className="absolute z-10 bg-white border border-blueheadline rounded w-full max-h-40 overflow-y-auto shadow-lg">
                        {composerOptions.filter(opt => opt.toLowerCase().includes(composer.toLowerCase())).slice(0, 10).map(opt => (
                          <li key={opt} className="px-3 py-1 cursor-pointer hover:bg-bluehighlight/20" onMouseDown={() => { setComposer(opt); setShowComposerSuggestions(false); }}>{opt}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="relative flex-1 min-w-[140px]">
                    <input
                        type="text"
                        placeholder="Filter by musician..."
                        value={musician}
                        onChange={(e) => { setMusician(e.target.value); setShowMusicianSuggestions(true); }}
                        onFocus={() => setShowMusicianSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowMusicianSuggestions(false), 100)}
                        className={`border-2 rounded px-3 py-2 w-full bg-cream font-sans text-navy focus:outline-none focus:ring-2 ${paletteClasses.border}`}
                    />
                    {showMusicianSuggestions && musician && (
                      <ul className="absolute z-10 bg-white border border-blueheadline rounded w-full max-h-40 overflow-y-auto shadow-lg">
                        {musicianOptions.filter(opt => opt.toLowerCase().includes(musician.toLowerCase())).slice(0, 10).map(opt => (
                          <li key={opt} className="px-3 py-1 cursor-pointer hover:bg-bluehighlight/20" onMouseDown={() => { setMusician(opt); setShowMusicianSuggestions(false); }}>{opt}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-auto items-center">
                    <button
                        className={`px-4 py-2 rounded font-semibold text-base font-sans border-2 transition ${view === 'card' ? paletteClasses.buttonActive : paletteClasses.button}`}
                        onClick={() => setView("card")}
                    >
                        Card View
                    </button>
                    <button
                        className={`px-4 py-2 rounded font-semibold text-base font-sans border-2 transition ${view === 'table' ? paletteClasses.buttonActive : paletteClasses.button}`}
                        onClick={() => setView("table")}
                    >
                        Table View
                    </button>
                    <button
                        className={`px-4 py-2 rounded font-semibold text-base font-sans border-2 transition ${view === 'calendar' ? paletteClasses.buttonActive : paletteClasses.button}`}
                        onClick={() => setView("calendar")}
                    >
                        Calendar View
                    </button>
                    <button
                        className={`px-3 py-2 rounded font-semibold text-base font-sans border-2 transition flex items-center justify-center ${paletteClasses.border} bg-cream hover:${paletteClasses.highlight}/20`}
                        title="Contact/About"
                        onClick={() => setShowContact(true)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-.659 1.591l-7.5 7.5a2.25 2.25 0 01-3.182 0l-7.5-7.5A2.25 2.25 0 012.25 6.993V6.75" />
                        </svg>
                    </button>
                    <button
                        className={`px-4 py-2 rounded font-semibold text-base font-sans border-2 transition ${paletteClasses.border} bg-cream hover:${paletteClasses.highlight}/20`}
                        title="Switch palette"
                        onClick={() => {
                            const idx = paletteKeys.indexOf(palette);
                            const next = paletteKeys[(idx + 1) % paletteKeys.length];
                            setPalette(next as typeof palette);
                        }}
                    >
                        🎨
                    </button>
                </div>
            </div>
            {view === "card" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {filtered
                        .slice()
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .map((concert, idx) => (
                            <ConcertCard key={idx} concert={concert} palette={palette} />
                        ))}
                </div>
            ) : view === "table" ? (
                <ConcertTable concerts={filtered} palette={palette} />
            ) : (
                <div className={`flex flex-col gap-4 rounded-lg p-4 border-2 ${paletteClasses.border} ${paletteClasses.bg}`}>
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    const newMonth = new Date(currentMonth);
                                    newMonth.setMonth(newMonth.getMonth() - 1);
                                    setCurrentMonth(newMonth);
                                }}
                                className={`px-4 py-2 rounded font-semibold text-base font-sans border-2 transition ${paletteClasses.button}`}
                            >
                                ←
                            </button>
                            <button
                                onClick={() => setCurrentMonth(new Date())}
                                className={`px-4 py-2 rounded font-semibold text-base font-sans border-2 transition ${paletteClasses.button}`}
                            >
                                Today
                            </button>
                            <button
                                onClick={() => {
                                    const newMonth = new Date(currentMonth);
                                    newMonth.setMonth(newMonth.getMonth() + 1);
                                    setCurrentMonth(newMonth);
                                }}
                                className={`px-4 py-2 rounded font-semibold text-base font-sans border-2 transition ${paletteClasses.button}`}
                            >
                                →
                            </button>
                        </div>
                        <div className={`text-xl font-bold ${paletteClasses.headline}`}>
                            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </div>
                        <button
                            onClick={() => {
                                const icsContent = generateICS(filtered);
                                const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
                                const link = document.createElement('a');
                                link.href = URL.createObjectURL(blob);
                                link.download = 'philharmonie-concerts.ics';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }}
                            className={`px-4 py-2 rounded font-semibold text-base font-sans border-2 transition ${paletteClasses.button}`}
                        >
                            Export to Calendar
                        </button>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className={`text-center font-semibold p-2 ${paletteClasses.text}`}>
                                {day}
                            </div>
                        ))}
                        {getCalendarDays(filtered, currentMonth).map((day, idx) => (
                            <div
                                key={idx}
                                className={`min-h-[100px] p-2 border rounded ${paletteClasses.card} ${
                                    day.isCurrentMonth
                                        ? paletteClasses.border
                                        : 'border-gray-200'
                                } ${day.isToday ? `${paletteClasses.bg}/20` : ''}`}
                            >
                                <div className={`text-sm font-semibold mb-1 ${day.isCurrentMonth ? '' : 'text-gray-400'}`}>
                                    {day.date.getDate()}
                                </div>
                                {day.concerts.map((concert, concertIdx) => (
                                    <div
                                        key={concertIdx}
                                        className={`text-xs p-1 mb-1 rounded cursor-pointer ${paletteClasses.text} ${
                                            `bg-${palette}highlight/20 hover:bg-${palette}highlight/30`
                                        }`}
                                        onClick={() => window.open(concert.booking_url, '_blank')}
                                    >
                                        {concert.title}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {filtered.length === 0 && (
                <div className="text-center text-navy mt-8">No concerts found.</div>
            )}
            {/* Contact/About Modal */}
            {showContact && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className={`rounded-lg shadow-lg p-6 max-w-md w-full border-2 ${paletteClasses.border} ${paletteClasses.bg} relative`}>
                        <button
                            className="absolute top-2 right-3 text-2xl font-bold focus:outline-none"
                            onClick={() => setShowContact(false)}
                            aria-label="Close"
                        >
                            ×
                        </button>
                        <div className={`text-lg font-bold mb-4 font-sans ${paletteClasses.text}`}>About</div>
                        <div className="flex flex-col gap-4 text-base font-sans">
                            <div className="flex items-start gap-2">
                                <span>🎻</span>
                                <span>This site is created to help music lovers explore concerts at the Philharmonie de Paris without scrolling endlessly.</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span>🔎</span>
                                <span>Offers better search, filters, calendar view, and email alerts.</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span>🛠️</span>
                                <span>Not affiliated with the Philharmonie de Paris. <span className="italic">All concert data is automatically scraped from the <a href="https://philharmoniedeparis.fr/en" target="_blank" rel="noopener noreferrer" className="underline">official Philharmonie website</a>.</span></span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span>❤️</span>
                                <span>Made with love by Sophie Bi, a software engineer, photographer and classical music enthusiast.
                                    See <a href="https://sophiebi.com" target="_blank" rel="noopener noreferrer" className="underline">more of my work</a>.<br />
                                </span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span>✉️</span>
                                <span>Questions or feedback? Please contact <a href="mailto:sophie4869@gmail.com" className={`underline ${paletteClasses.text}`}>sophie4869@gmail.com</a>.</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}