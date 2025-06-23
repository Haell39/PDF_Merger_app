/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}", // Diz ao Tailwind para escanear ficheiros JS/JSX na pasta src
        "./public/index.html",       // Para classes usadas diretamente no index.html
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}