"use client";
import React, { useEffect, useState } from "react";
import ConcertCard from "./ConcertCard";
import ConcertTable from "./ConcertTable";

interface Concert {
    title: string;
    description: string;
    location: string;
    image_url: string;
    booking_url: string;
    prices: number[];
    date: string;
    category: string;
}

export default function ConcertsClient({
    concerts,
    categories,
}: {
    concerts: Concert[];
    categories: string[];
}) {
    const [view, setView] = useState<"card" | "table">(
        () => (typeof window !== "undefined" && (localStorage.getItem("concertsView") as "card" | "table")) || "card"
    );
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [palette, setPalette] = useState<'blue' | 'peach'>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('palette') as 'blue' | 'peach') || 'blue';
        }
        return 'blue';
    });

    useEffect(() => {
        const handlePaletteChange = () => {
            setPalette((localStorage.getItem('palette') as 'blue' | 'peach') || 'blue');
        };
        window.addEventListener('palettechange', handlePaletteChange);
        return () => window.removeEventListener('palettechange', handlePaletteChange);
    }, []);

    useEffect(() => {
        localStorage.setItem("concertsView", view);
    }, [view]);

    const filtered = concerts.filter((c) => {
        const matchesSearch =
            c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.description.toLowerCase().includes(search.toLowerCase()) ||
            c.location.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category ? c.category === category : true;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className={`flex flex-col md:flex-row md:items-end gap-4 mb-6 p-4 rounded-lg border-2 ${palette === 'blue' ? 'border-blueheadline' : 'border-peachheadline'} bg-cream`}>
                <input
                    type="text"
                    placeholder="Search concerts..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`border-2 rounded px-3 py-2 w-full md:w-1/3 bg-cream font-sans text-navy focus:outline-none focus:ring-2 ${palette === 'blue' ? 'border-blueheadline focus:ring-blueheadline' : 'border-peachheadline focus:ring-peachheadline'}`}
                />
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`border-2 rounded px-3 py-2 bg-cream font-sans text-navy focus:outline-none focus:ring-2 ${palette === 'blue' ? 'border-blueheadline focus:ring-blueheadline' : 'border-peachheadline focus:ring-peachheadline'}`}
                >
                    <option value="">All categories</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
                <div className="flex gap-2 ml-auto">
                    <button
                        className={`px-4 py-2 rounded font-semibold text-base font-sans border-2 transition ${
                            palette === 'blue'
                                ? (view === 'card' ? 'bg-bluehighlight text-blueheadline border-blueheadline' : 'bg-bluebg text-blueheadline border-blueheadline')
                                : (view === 'card' ? 'bg-peachhighlight text-peachheadline border-peachheadline' : 'bg-peachbg text-peachheadline border-peachheadline')
                        }`}
                        onClick={() => setView("card")}
                    >
                        Card View
                    </button>
                    <button
                        className={`px-4 py-2 rounded font-semibold text-base font-sans border-2 transition ${
                            palette === 'blue'
                                ? (view === 'table' ? 'bg-bluehighlight text-blueheadline border-blueheadline' : 'bg-bluebg text-blueheadline border-blueheadline')
                                : (view === 'table' ? 'bg-peachhighlight text-peachheadline border-peachheadline' : 'bg-peachbg text-peachheadline border-peachheadline')
                        }`}
                        onClick={() => setView("table")}
                    >
                        Table View
                    </button>
                </div>
            </div>
            {view === "card" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {filtered.map((concert, idx) => (
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