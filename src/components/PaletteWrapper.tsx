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

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('bg-bluebg', 'bg-peachbg');
      document.body.classList.add(palette === 'blue' ? 'bg-bluebg' : 'bg-peachbg');
    }
  }, [palette]);

  return (
    <div className={palette === 'blue' ? 'min-h-screen text-blueheadline' : 'min-h-screen text-peachheadline'}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Palette switch button removed from here */}
      </div>
      <div className="max-w-7xl mx-auto px-4">
        {React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<any>, { palette, setPalette })
          : children}
      </div>
    </div>
  );
}
