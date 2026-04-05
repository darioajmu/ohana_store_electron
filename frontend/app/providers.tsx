'use client';

import * as React from 'react';
import { MantineProvider } from '@mantine/core';
import { NextUIProvider } from '@nextui-org/system';
import { useRouter } from 'next/navigation';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ThemeProviderProps } from 'next-themes/dist/types';
import { DatesProvider } from '@mantine/dates';
import 'dayjs/locale/es';

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();
  const stopTableNavigation = (event: React.KeyboardEvent<HTMLElement>) => {
    const target = event.target as HTMLElement | null;

    if (!target) return;

    const isInteractiveTarget = Boolean(
      target.closest('input, textarea, select, button, [contenteditable="true"], [role="textbox"], [role="combobox"]')
    );
    const isInsideTable = Boolean(target.closest('table, [role="grid"]'));

    if (isInteractiveTarget && isInsideTable) {
      event.stopPropagation();
    }
  };

  return (
    <NextUIProvider navigate={router.push}>
      <NextThemesProvider {...themeProps}>
        <MantineProvider forceColorScheme='dark'>
          <DatesProvider settings={{ firstDayOfWeek: 1, locale: 'es' }}>
            <div onKeyDownCapture={stopTableNavigation}>
              {children}
            </div>
          </DatesProvider>
        </MantineProvider>
      </NextThemesProvider>
    </NextUIProvider>
  );
}
