import { createTheme } from '@mui/material/styles';
import { colorTokens, typographyTokens, shapeTokens, spacingTokens } from './tokens';

export const theme = createTheme({
  cssVariables: true,
  colorSchemes: {
    dark: true,
  },
  palette: {
    mode: 'dark',
    background: colorTokens.background,
    text: colorTokens.text,
    primary: colorTokens.primary,
    secondary: colorTokens.secondary,
    success: colorTokens.success,
    error: colorTokens.error,
    warning: colorTokens.warning,
    divider: colorTokens.divider,
  },
  typography: {
    fontFamily: typographyTokens.fontFamilyBody,
    fontSize: typographyTokens.fontSizeBase,
  },
  shape: {
    borderRadius: shapeTokens.borderRadius,
  },
  spacing: spacingTokens.unit,
});
