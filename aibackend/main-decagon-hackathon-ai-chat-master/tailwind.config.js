/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        "spin-slow": "spin 3s linear infinite",
      },
      colors: {
        // Adding custom neon colors to match the code
        cyan: {
          500: "#00ffff",
          400: "#22d3ee",
        },
        magenta: {
          400: "#ff00ff",
        },
      },
    },
  },
  plugins: [],
};
