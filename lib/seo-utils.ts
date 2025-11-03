import { Metadata } from 'next';

/**
 * Base URL for the application
 */
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://projitt.com';

/**
 * Default Open Graph image
 */
const defaultOgImage = '/images/logo.png';

/**
 * Generate metadata for a page with SEO optimizations
 */
export function generateMetadata({
    title,
    description,
    path = '',
    image = defaultOgImage,
    noIndex = false,
    keywords = [],
}: {
    title: string;
    description: string;
    path?: string;
    image?: string;
    noIndex?: boolean;
    keywords?: string[];
}): Metadata {
    const url = `${baseUrl}${path}`;
    const fullTitle = `${title} | Projitt`;

    return {
        title,
        description,
        keywords: ['HR management', 'HRMS', ...keywords],
        alternates: {
            canonical: url,
        },
        openGraph: {
            title: fullTitle,
            description,
            url,
            siteName: 'Projitt',
            images: [
                {
                    url: image.startsWith('http') ? image : `${baseUrl}${image}`,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            locale: 'en_US',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: fullTitle,
            description,
            images: [image.startsWith('http') ? image : `${baseUrl}${image}`],
        },
        robots: noIndex
            ? {
                index: false,
                follow: false,
            }
            : {
                index: true,
                follow: true,
            },
    };
}

/**
 * Generate JSON-LD breadcrumb schema
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${baseUrl}${item.url}`,
        })),
    };
}

/**
 * Generate JSON-LD article schema
 */
export function generateArticleSchema({
    headline,
    description,
    image,
    datePublished,
    dateModified,
    author = 'Projitt',
}: {
    headline: string;
    description: string;
    image: string;
    datePublished: string;
    dateModified?: string;
    author?: string;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline,
        description,
        image: image.startsWith('http') ? image : `${baseUrl}${image}`,
        datePublished,
        dateModified: dateModified || datePublished,
        author: {
            '@type': 'Organization',
            name: author,
        },
        publisher: {
            '@type': 'Organization',
            name: 'Projitt',
            logo: {
                '@type': 'ImageObject',
                url: `${baseUrl}/images/logo.png`,
            },
        },
    };
}

/**
 * Generate JSON-LD FAQ schema
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };
}

/**
 * Generate JSON-LD SoftwareApplication schema for HR platform
 */
export function generateSoftwareApplicationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Projitt',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web Browser',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '100',
        },
    };
}

