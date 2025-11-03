import { JSX } from 'react';

/**
 * StructuredData component provides JSON-LD structured data for SEO.
 * This helps search engines better understand the organization and website.
 */
export function StructuredData(): JSX.Element {
    const organizationSchema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Projitt',
        url: process.env.NEXT_PUBLIC_BASE_URL || 'https://projitt.com',
        logo: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://projitt.com'}/images/logo.png`,
        sameAs: [
            // Add your social media URLs here
            // 'https://www.facebook.com/projitt',
            // 'https://www.twitter.com/projitt',
            // 'https://www.linkedin.com/company/projitt',
        ],
    };

    const websiteSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Projitt',
        url: process.env.NEXT_PUBLIC_BASE_URL || 'https://projitt.com',
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://projitt.com'}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };

    const webApplicationSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Projitt',
        url: process.env.NEXT_PUBLIC_BASE_URL || 'https://projitt.com',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web Browser',
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: process.env.NEXT_PUBLIC_BASE_URL || 'https://projitt.com',
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
        </>
    );
}

