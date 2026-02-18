export const THEME_MODES = {
    DARK: 'dark',
};

export const DARK_THEME = {
    primary: '#818CF8',
    secondary: '#F472B6',
    accent: '#FCD34D',
    background: '#000000',
    surface: '#0A0A0A',
    surfaceVariant: '#1A1A1A',
    text: '#FFFFFF',
    textSecondary: '#A0A0A0',
    border: '#2A2A2A',
    error: '#F87171',
    success: '#34D399',
    warning: '#FBBF24',
    shadow: 'rgba(0, 0, 0, 0.5)',
    backgroundTransparent: 'rgba(0, 0, 0, 0.5)',
};

// Alias for compatibility
export const LIGHT_THEME = DARK_THEME;

export const CANVAS_PRESETS = [
    { name: 'HD', width: 1080, height: 1920 },
    { name: 'QHD', width: 1440, height: 2560 },
    { name: 'QHD+', width: 1440, height: 3200 },
    { name: 'FHD+', width: 1080, height: 2340 },
    { name: 'Custom', width: 1080, height: 1920 },
];

export const FONTS = [
    { name: 'System', family: 'System' },
    { name: 'Roboto', family: 'Roboto' },
    { name: 'Montserrat', family: 'Montserrat' },
    { name: 'Open Sans', family: 'OpenSans' },
    { name: 'Lato', family: 'Lato' },
    { name: 'Playfair', family: 'PlayfairDisplay' },
    { name: 'Bebas', family: 'BebasNeue' },
];
