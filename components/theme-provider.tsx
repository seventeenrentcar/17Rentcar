'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ComponentProps } from 'react'

type NextThemeProviderProps = ComponentProps<typeof NextThemesProvider>

type ThemeProviderProps = NextThemeProviderProps & {
  children: React.ReactNode;
};

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  );
}
