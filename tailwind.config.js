/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            screens: {
                'xs': '400px', // Extra small mobile
                'fold': '280px', // Foldable screens
            },
            colors: {
                "primary": "#135bec", // Reference primary
                "background-light": "#ffffff", // Reference light background
                "background-dark": "#0B0F1A", // Reference dark background
                "card-dark": "#111827", // Added for Student Performance
                "border-dark": "#1f2937", // Added for Student Performance
                "accent-neon": "#00d4ff", // Reference accent
            },
            fontFamily: {
                "display": ["Inter", "sans-serif"],
                "sans": ["Inter", "sans-serif"],
            },
        },
    },
    plugins: [],
}
