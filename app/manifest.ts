import { MetadataRoute } from 'next';

/**
 * Generates the Web App Manifest for PWA support.
 * This improves mobile experience and can help with app-like installation.
 */
export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Projitt',
        short_name: 'Projitt',
        description: 'Projitt',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0D978B',
        orientation: 'portrait-primary',
        icons: [
            {
                src: '/images/logo.png',
                sizes: 'any',
                type: 'image/png',
            },
            {
                src: '/images/logo.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/images/logo.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
        categories: ['business', 'productivity'],
        lang: 'en',
        dir: 'ltr',
    };
}

