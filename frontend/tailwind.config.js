/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1",

        accent: "#a855f7",

        secondary: "#06b6d4",

        "dark-bg": "#0a0a0f",
        "dark-card": "#1a1a24",
        "light-text": "#f1f5f9",
      },
    },
  },
  plugins: [],
};

