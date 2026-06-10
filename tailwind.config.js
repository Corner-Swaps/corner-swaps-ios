/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './app.js'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'forest-green': 'var(--forest-green-val)',
                'warm-cream': 'var(--warm-cream-val)',
                'outline-variant': 'rgba(48, 138, 94, 0.15)',
                'outline': 'rgba(48, 138, 94, 0.4)',
                'on-surface-variant': 'rgba(48, 138, 94, 0.7)',
                'on-surface': 'var(--forest-green-val)',
                'surface-container': '#ffffff',
                'surface-container-low': '#ffffff',
                'surface-container-lowest': '#ffffff',
                'background': 'var(--warm-cream-val)',
                'surface': 'var(--warm-cream-val)',
                'error': '#ba1a1a',
                'primary': 'var(--forest-green-val)',
                'primary-container': 'var(--forest-green-val)',
                'on-primary': 'var(--warm-cream-val)'
            },
            borderRadius: {
                'xl': '12px',
                '2xl': '16px',
                'full': '9999px'
            },
            fontFamily: {
                headline: ['Outfit', 'sans-serif'],
                body: ['Outfit', 'sans-serif']
            }
        }
    }
};
