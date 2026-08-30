/**
 * Starshine Drive brand colors — synced from artifacts/starshine-drives/src/index.css
 *
 * Light:  primary #093C71 (navy), accent #EF6F24 (orange), bg #F5F5F5
 * Dark:   primary #2467B3, accent #EF6F24, bg #121212
 */

const colors = {
  light: {
    text: '#1A1A1A',
    tint: '#093C71',

    background: '#F5F5F5',
    foreground: '#1A1A1A',

    card: '#FFFFFF',
    cardForeground: '#1A1A1A',

    primary: '#093C71',
    primaryForeground: '#FFFFFF',

    secondary: '#EBF0F7',
    secondaryForeground: '#093C71',

    muted: '#EBEBEB',
    mutedForeground: '#737373',

    accent: '#EF6F24',
    accentForeground: '#FFFFFF',

    destructive: '#F04040',
    destructiveForeground: '#FFFFFF',

    border: '#E0E0E0',
    input: '#E0E0E0',
  },

  dark: {
    text: '#F5F5F5',
    tint: '#2467B3',

    background: '#121212',
    foreground: '#F5F5F5',

    card: '#1E1E1E',
    cardForeground: '#F5F5F5',

    primary: '#2467B3',
    primaryForeground: '#FFFFFF',

    secondary: '#262626',
    secondaryForeground: '#F5F5F5',

    muted: '#262626',
    mutedForeground: '#A6A6A6',

    accent: '#EF6F24',
    accentForeground: '#FFFFFF',

    destructive: '#8B1A1A',
    destructiveForeground: '#FFFFFF',

    border: '#2E2E2E',
    input: '#2E2E2E',
  },

  // Border radius in px — matches web --radius: 3px but bumped for touch comfort
  radius: 6,
};

export default colors;
