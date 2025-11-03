'use client';

import { useReportWebVitals } from 'next/web-vitals';

/**
 * WebVitals component tracks Core Web Vitals metrics for performance monitoring.
 * Metrics tracked: CLS, FID, FCP, LCP, TTFB, INP
 * 
 * These metrics are crucial for SEO and user experience.
 * You can integrate with analytics services like Google Analytics, Vercel Analytics, etc.
 */
export function WebVitals() {
    useReportWebVitals((metric) => {
        // Log metrics to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log(metric);
        }

        // Send metrics to your analytics endpoint
        // Example: Send to Google Analytics
        // if (window.gtag) {
        //   window.gtag('event', metric.name, {
        //     value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        //     event_label: metric.id,
        //     non_interaction: true,
        //   });
        // }

        // Example: Send to your custom analytics API
        // fetch('/api/analytics', {
        //   method: 'POST',
        //   body: JSON.stringify({
        //     name: metric.name,
        //     value: metric.value,
        //     id: metric.id,
        //     navigationType: metric.navigationType,
        //   }),
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        // });
    });

    return null;
}

