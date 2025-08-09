// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",  // This tells Tailwind where to look for classes
    ],
    theme: {
        extend: {
            // We can add custom colors here later if needed
            colors: {
                slate: {
                    950: '#020617',  // Darker shade for your background
                }
            }
        },
    },
    plugins: [],
}