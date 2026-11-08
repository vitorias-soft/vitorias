/**
 * Valores extraídos do protótipo no Figma, que não tem variáveis de design.
 * Onde o protótipo não atinge contraste AA em texto, o tom foi escurecido:
 * `textMuted` (protótipo #8A7B93) e `emergency` (protótipo #FF5C70).
 */
export const Colors = {
  background: '#F7F2EE',
  surface: '#FFFFFF',
  surfaceMuted: '#EFE7DF',
  surfaceAccent: '#EFE7E8',
  iconTile: 'rgba(181, 136, 145, 0.21)',
  border: 'rgba(112, 75, 99, 0.55)',
  primary: '#3F2A63',
  primaryText: '#3D2C61',
  plum: '#704B63',
  mauve: '#B58891',
  label: '#524271',
  textMuted: '#6B5C75',
  text: '#000000',
  onPrimary: '#FFFFFF',
  emergency: '#D92D45',
} as const;

export const Fonts = {
  heading: 'Poppins_700Bold',
  headingMedium: 'Poppins_500Medium',
  body: 'PublicSans_500Medium',
  bodyBold: 'PublicSans_700Bold',
  brand: 'Itim_400Regular',
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  small: 10,
  large: 20,
} as const;

/** Alvo mínimo de toque (WCAG e Material). */
export const MinTouch = 48;
