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
            <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search concerts..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border border-blue rounded px-3 py-2 w-full md:w-1/3 bg-cream text-navy focus:outline-none focus:ring-2 focus:ring-blue"
                />
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="border border-blue rounded px-3 py-2 bg-cream text-navy focus:outline-none focus:ring-2 focus:ring-blue"
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
                        className={`px-4 py-2 rounded font-semibold border ${view === "card" ? "bg-blue text-cream" : "bg-cream text-navy border-blue"
                            }`}
                        onClick={() => setView("card")}
                    >
                        Card View
                    </button>
                    <button
                        className={`px-4 py-2 rounded font-semibold border ${view === "table" ? "bg-blue text-cream" : "bg-cream text-navy border-blue"
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
                        <ConcertCard key={idx} concert={concert} />
                    ))}
                </div>
            ) : (
                <ConcertTable concerts={filtered} />
            )}
            {filtered.length === 0 && (
                <div className="text-center text-navy mt-8">No concerts found.</div>
            )}
        </div>
    );
}