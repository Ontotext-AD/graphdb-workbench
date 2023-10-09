PluginRegistry.add('themes', {
    // The name of the theme. Must contain only lowercase letters, hyphen, underscore. This is the differentiator
    // property for all registered themes.
    'name': 'default-theme',
    // The theme label or a key for a label from i18n resource bundle.
    'label': 'security.workbench.settings.theme.default-theme',
    // CSS variables, "foo: bar" becomes "--foo: bar"
    'variables': {
        // Primary color, like a main brand color. This is in a HSL format composed by three values below
        'primary-color-hue': '13.4',
        'primary-color-saturation': '87.9%',
        'primary-color-lightness': '33%',
        // Secondary color, like a contrast main brand color. This is in a HSL format composed by three values below
        'secondary-color-hue': '207.3',
        'secondary-color-saturation': '100%',
        'secondary-color-lightness': '19.4%',
        // Tertiary color, like a complimentary color. This is in a HSL format composed by three values below
        'tertiary-color-hue': '174.6',
        'tertiary-color-saturation': '97.7%',
        'tertiary-color-lightness': '33.5%',
        // A color used for the font/svg icons when placed on a primary color background.
        'icon-on-primary-color': 'rgba(255, 255, 255, 0.8)',
        'gray-color': '#97999C',
        // Colors for the toastr notifications, the tag-xxx and the text-xxx classes in any of their four states
        // (i.e. dark colored things)
        'color-danger-dark': 'hsl(353, 78%, 36%)',
        'color-success-dark': 'hsl(var(--tertiary-color-hue), var(--tertiary-color-saturation), calc(var(--tertiary-color-lightness)*0.5))',
        'color-warning-dark': 'var(--primary-color-dark)',
        'color-info-dark': 'var(--secondary-color-light)',
        // Colors for the alert boxes (i.e. light colored things).
        // Success and info are the same color since we don't use success much if at all
        'color-danger-light': '#a4142433',
        'color-success-light': 'hsla(var(--tertiary-color-hsl), 0.15)',
        'color-warning-light': 'hsla(var(--primary-color-hsl), 0.07)',
        'color-info-light': 'hsla(var(--tertiary-color-hsl), 0.15)',
        'color-help-light': 'hsla(var(--secondary-color-hsl), 0.1)',
        // Colors for fading danger/warning buttons, these are intermediate in intensity between dark and light,
        // and they should not use alpha channel because that doesn't play nice with border color
        'color-danger-medium': 'hsl(353, 78%, 83%)',
        'color-warning-medium': 'hsl(var(--primary-color-hue), var(--primary-color-saturation), 83%)',
        // Colors for the logo - logo proper, text in logo, logo background
        'logo-color': 'var(--primary-color-light)',
        'logo-text-color': 'white',
        'logo-background-color': 'var(--secondary-color-dark)'
    },
    // Dark theme
    'dark': {
        'variables': {
            // Dark definition variables that affect things at a global scale
            'body-filter': 'invert(95%) hue-rotate(180deg)',
            'html-background': '#0d0d0d',
            'media-filter': 'invert(100%) hue-rotate(180deg)',
            'alert-filter': 'contrast(2)',
            'checkbox-filter': 'invert(100%) hue-rotate(180deg)',
            'toast-filter': 'invert(95%) hue-rotate(180deg) contrast(1.2)',
            // Slightly different colors that work better in dark mode
            'primary-color-lightness': '60%',
            'secondary-color-saturation': '70%',
            'color-warning-light': 'hsla(var(--primary-color-hsl), 0.15)',
            'logo-color': 'var(--primary-color-dark)'
        },
        // CSS properties, "foo: bar" becomes "foo: bar"
        'properties': {
            // Notify browser that we support dark theme, makes checkboxes look better
            'color-scheme': 'light dark'
        }
    }
});
