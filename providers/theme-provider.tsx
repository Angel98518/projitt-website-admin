'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';

/**
 * ThemeProvider Component
 *
 * This component wraps the entire application with theme and tooltip context providers.
 * It enables light/dark themes, respects system preferences, and disables transitions during theme change.
 * It also globally enables tooltips with zero delay for consistent UX.
 */
export function ThemeProvider({
  children,
}: React.ComponentProps<typeof NextThemesProvider>): React.ReactElement {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      storageKey="nextjs-theme"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      {/* 
        TooltipProvider manages tooltips globally with no delay.
        data-testid and id aid in UI test automation.
      */}
      <TooltipProvider
        delayDuration={0}
      >
        {children}
      </TooltipProvider>
    </NextThemesProvider>
  );
}
