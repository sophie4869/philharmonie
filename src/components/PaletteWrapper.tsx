"use client";
import React, { useState, useEffect } from "react";

export const PALETTE_CONFIG = {
  blue: {
    bg: 'bg-bluebg',
    text: 'text-blueheadline',
    highlight: 'bg-bluehighlight',
    border: 'border-blueheadline',
    button: 'bg-bluehighlight text-blueheadline border-blueheadline hover:bg-blueheadline hover:text-bluehighlight',
    buttonActive: 'bg-blueheadline text-bluehighlight border-blueheadline',
    tableHeader: 'bg-blueheadline text-bluehighlight',
  },
  peach: {
    bg: 'bg-peachbg',
    text: 'text-peachheadline',
    highlight: 'bg-peachhighlight',
    border: 'border-peachheadline',
    button: 'bg-peachhighlight text-peachheadline border-peachheadline hover:bg-peachheadline hover:text-peachhighlight',
    buttonActive: 'bg-peachheadline text-peachhighlight border-peachheadline',
    tableHeader: 'bg-peachheadline text-peachhighlight',
  },
  mint: {
    bg: 'bg-mintbg',
    text: 'text-mintheadline',
    highlight: 'bg-minthighlight',
    border: 'border-mintheadline',
    button: 'bg-minthighlight text-mintheadline border-mintheadline hover:bg-mintheadline hover:text-minthighlight',
    buttonActive: 'bg-mintheadline text-minthighlight border-mintheadline',
    tableHeader: 'bg-mintheadline text-minthighlight',
  },
};
type PaletteKey = keyof typeof PALETTE_CONFIG;

export default function PaletteWrapper({ children }: { children: React.ReactNode }) {
  // Always default to 'blue' for SSR and initial client render
  const [palette, setPalette] = useState<PaletteKey>('blue');

  // Only read from localStorage on the client after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('palette');
      if (stored && Object.keys(PALETTE_CONFIG).includes(stored)) {
        setPalette(stored as PaletteKey);
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

  const paletteClasses = PALETTE_CONFIG[palette] || PALETTE_CONFIG.blue;

  useEffect(() => {
    if (typeof document !== 'undefined') {
      Object.values(PALETTE_CONFIG).forEach(cfg => document.body.classList.remove(cfg.bg));
      document.body.classList.add(paletteClasses.bg);
    }
  }, [palette, paletteClasses.bg]);

  return (
    <div className={`min-h-screen ${paletteClasses.text}`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Palette switch button removed from here */}
      </div>
      <div className="max-w-7xl mx-auto px-4">
        {React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<{ palette: PaletteKey; setPalette: (palette: PaletteKey) => void }>, { palette, setPalette })
          : children}
      </div>
    </div>
  );
}
