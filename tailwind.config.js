/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    'bg-bluehighlight/20',
    'bg-peachhighlight/20',
    'bg-minthighlight/20',
    'hover:bg-bluehighlight/30',
    'hover:bg-peachhighlight/30',
    'hover:bg-minthighlight/30',
  ],
  theme: {
    extend: {
      colors: {
        // Blue palette
        bluebg: "#d8eefe",
        blueheadline: "#094067",
        bluesub: "#5f6c7b",
        bluecard: "#ffffff",
        bluecardheading: "#094067",
        bluecardpara: "#5f6c7b",
        bluestroke: "#094067",
        bluemain: "#ffffff",
        bluehighlight: 'rgb(61 169 252 / <alpha-value>)',
        bluesecondary: "#90b4ce",
        bluetertiary: "#ef4565",

        // Peach palette
        peachbg: "#f3d2c1",
        peachheadline: "#001858",
        peachsub: "#172c66",
        peachcard: "#fef6e4",
        peachcardheading: "#001858",
        peachcardpara: "#172c66",
        peachstroke: "#001858",
        peachmain: "#f3d2c1",
        peachhighlight: 'rgb(245 130 174 / <alpha-value>)',
        peachsecondary: "#8bd3dd",
        peachtertiary: "#f582ae",

        // Mint palette
        mintbg: "#abd1c6",
        mintheadline: "#004643",
        mintsub: "#0f3433",
        mintcard: "#e4f7ed",
        mintcardheading: "#fffffe",
        mintcardpara: "#abd1c6",
        mintstroke: "#001e1d",
        mintmain: "#e8e4e6",
        minthighlight: 'rgb(249 188 96 / <alpha-value>)',
        mintsecondary: "#abd1c6",
        minttertiary: "#e16162",
      },
    },
  },
  plugins: [],
}; 