/**
 * Typed design tokens — the single source of truth for theme values.
 * `theme.ts` maps these onto an MUI theme; components should reach for
 * `theme.palette.*` / `theme.spacing()` rather than importing tokens directly.
 */

export const colorTokens = {
  background: {
    default: '#0b0f10',
    paper: '#12181a',
  },
  text: {
    primary: '#e7ecec',
    secondary: '#9fb0ae',
  },
  primary: {
    main: '#5eead4',
    contrastText: '#08201c',
  },
  secondary: {
    main: '#f5a97f',
    contrastText: '#2a1608',
  },
  success: {
    main: '#7ee787',
  },
  error: {
    main: '#ff8080',
  },
  warning: {
    main: '#f2cc60',
  },
  divider: 'rgba(231, 236, 236, 0.12)',
} as const;

export const typographyTokens = {
  fontFamilyBody: 'var(--font-body), "Segoe UI", system-ui, sans-serif',
  fontFamilyMono: 'var(--font-mono), "Fira Code", ui-monospace, monospace',
  fontSizeBase: 15,
} as const;

export const shapeTokens = {
  borderRadius: 8,
} as const;

export const spacingTokens = {
  unit: 8,
} as const;
