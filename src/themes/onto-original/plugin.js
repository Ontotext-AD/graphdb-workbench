PluginRegistry.add('themes', {
    'name': 'onto-original-theme',
    'label': 'security.workbench.settings.theme.onto-original-theme',
    'variables': {
        'primary-color-hue': '17',
        'primary-color-saturation': '87.9%',
        'primary-color-lightness': '49%',
        'secondary-color-hue': '207.3',
        'secondary-color-saturation': '100%',
        'secondary-color-lightness': '19.4%',
        'tertiary-color-hue': '174.6',
        'tertiary-color-saturation': '97.7%',
        'tertiary-color-lightness': '33.5%',
        'icon-on-primary-color': 'rgba(255, 255, 255, 0.8)',
        'gray-color': '#97999C',
        'color-danger-dark': '#bd362f',
        'color-success-dark': '#51a351',
        'color-warning-dark': '#f89406',
        'color-info-dark': '#2f96b4',
        'color-danger-light': 'rgba(242, 222, 222, 0.7)',
        'color-success-light': 'rgba(219, 252, 202, 0.7)',
        'color-warning-light': 'rgba(252, 248, 227, 0.7)',
        'color-info-light': 'rgba(203, 238, 234, 0.7)',
        'color-help-light': '#e8f5fe',
        'color-danger-medium': 'hsl(353, 78%, 83%)',
        'color-warning-medium': 'hsl(var(--primary-color-hue), var(--primary-color-saturation), 83%)',
        'logo-color': '#E84E0F;',
        'logo-text-color': '#FFFFFF',
        'logo-background-color': 'var(--secondary-color)'
    },
    'dark': {
        'variables': {
            'body-filter': 'invert(95%) hue-rotate(180deg)',
            'html-background': '#0d0d0d',
            'media-filter': 'invert(100%) hue-rotate(180deg)',
            'alert-filter': 'brightness(0.8)',
            'checkbox-filter': 'invert(100%) hue-rotate(180deg)',
            'toast-filter': 'invert(90%) hue-rotate(180deg) contrast(1.2)',

            'primary-color-hue': '14',
            'primary-color-saturation': '78%',
            'primary-color-lightness': '64%'
        },
        'properties': {
            'color-scheme': 'light dark'
        }
    }
});
