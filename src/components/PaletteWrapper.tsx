"use client";
import React, { useState } from "react";

export default function PaletteWrapper({ children }: { children: React.ReactNode }) {
  const [palette, setPalette] = useState<'blue' | 'peach'>('blue');
  return (
    <div className={palette === 'blue' ? 'min-h-screen bg-bluebg text-blueheadline' : 'min-h-screen bg-peachbg text-peachheadline'}>
      <div className="flex justify-end p-4">
        <button
          className={`px-4 py-2 rounded font-semibold border mr-2 ${palette === 'blue' ? 'bg-bluehighlight text-blueheadline border-blueheadline' : 'bg-peachhighlight text-peachheadline border-peachheadline'}`}
          onClick={() => setPalette(palette === 'blue' ? 'peach' : 'blue')}
        >
          Switch to {palette === 'blue' ? 'Peach' : 'Blue'} Palette
        </button>
      </div>
      {children}
    </div>
  );
}
