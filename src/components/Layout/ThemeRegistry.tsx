'use client';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { baseTheme } from '@/theme/theme';

/**
 * Provides the MUI ThemeProvider and CssBaseline reset to all descendants.
 * @param props.children - Child components that consume the MUI theme.
 */
export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={baseTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
