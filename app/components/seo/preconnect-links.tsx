/**
 * PreconnectLinks component adds DNS prefetch and preconnect links
 * to external domains for better performance.
 * 
 * This reduces DNS lookup time for external resources.
 */
export function PreconnectLinks() {
    return (
        <>
            {/* Google Fonts - if used */}
            {/* <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" /> */}

            {/* Google Analytics - if used */}
            {/* <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      <link rel="preconnect" href="https://www.googletagmanager.com" /> */}

            {/* CDN or API domains - add your domains here */}
            {/* <link rel="dns-prefetch" href="https://your-api-domain.com" />
      <link rel="preconnect" href="https://your-cdn-domain.com" /> */}
        </>
    );
}

