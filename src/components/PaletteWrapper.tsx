"use client";
import React, { useState, useEffect } from "react";

export default function PaletteWrapper({ children }: { children: React.ReactNode }) {
  // Always default to 'blue' for SSR and initial client render
  const [palette, setPalette] = useState<'blue' | 'peach'>('blue');

  // Only read from localStorage on the client after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('palette');
      if (stored === 'blue' || stored === 'peach') {
        setPalette(stored);
      }
    }
  }, []);

  // Update localStorage when palette changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('palette', palette);
      window.dispatchEvent(new Event('palettechange'));
    }
  }, [palette]);

  return (
    <div className={palette === 'blue' ? 'min-h-screen bg-bluebg text-blueheadline' : 'min-h-screen bg-peachbg text-peachheadline'}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-end p-4">
          <button
            className={`px-4 py-2 rounded font-semibold text-base font-sans border-2 mr-2 transition ${palette === 'blue' ? 'bg-bluehighlight text-blueheadline border-blueheadline' : 'bg-peachhighlight text-peachheadline border-peachheadline'}`}
            onClick={() => setPalette(palette === 'blue' ? 'peach' : 'blue')}
          >
            Switch to {palette === 'blue' ? 'Peach' : 'Blue'} Palette
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4">
        {children}
      </div>
    </div>
  );
}
