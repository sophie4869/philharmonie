"use client";
import React, { useEffect, useState, useMemo } from "react";
import ConcertCard from "./ConcertCard";
import ConcertTable from "./ConcertTable";
import { ProgramItem } from "../utils/scraping";
import { PALETTE_CONFIG } from "./PaletteWrapper";

interface Concert {
    title: string;
    description: string;
    location: string;
    image_url: string;
    booking_url: string;
    prices: number[];
    date: string;
    category: string;
    program: ProgramItem[];
}

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
    const [view, setView] = useState<"card" | "table">("card");
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [composer, setComposer] = useState("");
    const [musician, setMusician] = useState("");
    const [director, setDirector] = useState("");
    const [showComposerSuggestions, setShowComposerSuggestions] = useState(false);
    const [showMusicianSuggestions, setShowMusicianSuggestions] = useState(false);
    const [showDirectorSuggestions, setShowDirectorSuggestions] = useState(false);

    useEffect(() => {
        // Set initial view from localStorage on client mount
        const storedView = localStorage.getItem("concertsView") as "card" | "table";
        if (storedView) {
            setView(storedView);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("concertsView", view);
    }, [view]);

    // Extract unique composers, musicians, directors
    const composerOptions = useMemo(() => {
        const set = new Set<string>();
        concerts.forEach(c => c.program.forEach(item => {
            if (item.composer) set.add(item.composer);
        }));
        return Array.from(set).sort();
    }, [concerts]);
    const musicianOptions = useMemo(() => {
        const set = new Set<string>();
        concerts.forEach(c => c.program.forEach(item => {
            if (item.details) {
                // Split by common separators
                item.details.split(/[;,\n]/).forEach(part => {
                    const trimmed = part.trim();
                    if (trimmed) set.add(trimmed);
                });
            }
        }));
        return Array.from(set).sort();
    }, [concerts]);
    const directorOptions = musicianOptions; // For now, use same as musician (can refine if needed)

    const filtered = concerts.filter((c) => {
        const matchesSearch =
            c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.description.toLowerCase().includes(search.toLowerCase()) ||
            c.location.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category ? c.category === category : true;
        
        // Check if any program item matches the composer filter
        const matchesComposer = composer ? c.program.some(item => 
            item.composer?.toLowerCase().includes(composer.toLowerCase())
        ) : true;

        // Check if any program item's details match the musician filter
        const matchesMusician = musician ? c.program.some(item => 
            item.details?.toLowerCase().includes(musician.toLowerCase())
        ) : true;

        // Check if any program item's details match the director filter
        const matchesDirector = director ? c.program.some(item => 
            item.details?.toLowerCase().includes(director.toLowerCase())
        ) : true;

        return matchesSearch && matchesCategory && matchesComposer && matchesMusician && matchesDirector;
    });

    const paletteKeys = Object.keys(PALETTE_CONFIG);
    const paletteClasses = PALETTE_CONFIG[palette] || PALETTE_CONFIG.blue;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
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
                  <div className="relative flex-1 min-w-[140px]">
                    <input
                        type="text"
                        placeholder="Filter by director..."
                        value={director}
                        onChange={(e) => { setDirector(e.target.value); setShowDirectorSuggestions(true); }}
                        onFocus={() => setShowDirectorSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowDirectorSuggestions(false), 100)}
                        className={`border-2 rounded px-3 py-2 w-full bg-cream font-sans text-navy focus:outline-none focus:ring-2 ${paletteClasses.border}`}
                    />
                    {showDirectorSuggestions && director && (
                      <ul className="absolute z-10 bg-white border border-blueheadline rounded w-full max-h-40 overflow-y-auto shadow-lg">
                        {directorOptions.filter(opt => opt.toLowerCase().includes(director.toLowerCase())).slice(0, 10).map(opt => (
                          <li key={opt} className="px-3 py-1 cursor-pointer hover:bg-bluehighlight/20" onMouseDown={() => { setDirector(opt); setShowDirectorSuggestions(false); }}>{opt}</li>
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
            ) : (
                <ConcertTable concerts={filtered} palette={palette} />
            )}
            {filtered.length === 0 && (
                <div className="text-center text-navy mt-8">No concerts found.</div>
            )}
        </div>
    );
}