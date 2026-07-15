/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        notion: {
          bg: "#ffffff",
          "bg-dark": "#191919",
          sidebar: "#fbfbfa",
          "sidebar-dark": "#1a1a1a",
          text: "#37352f",
          "text-dark": "#e5e5e5",
          muted: "#9b9a97",
          "muted-dark": "#6b6b6b",
          border: "#e9e9e7",
          "border-dark": "#2f2f2f",
          accent: "#2383e2",
          "accent-hover": "#0b6bcb",
          green: "#0f7b6c",
          red: "#e03e3e",
          yellow: "#dfab01",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
      },
      fontSize: {
        xs: "0.75rem",
        sm: "0.875rem",
        base: "0.9375rem",
        lg: "1.0625rem",
      },
    },
  },
  plugins: [],
};
