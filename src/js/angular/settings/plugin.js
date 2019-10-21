PluginRegistry.add('route', [
    {
        'url': '/license/register',
        'module': 'graphdb.framework.settings',
        'path': 'settings/app',
        'chunk': 'settings',
        'controller': 'RegisterLicenseCtrl',
        'templateUrl': 'pages/registerLicenseInfo.html',
        'title': 'Register GraphDB License',
        'helpInfo': 'The Register GraphDB License view is where you register your GraphDB. '
        + 'Upload the generated binary or simply copy the license key in the designated text area.'
    }, {
        'url': '/license',
        'module': 'graphdb.framework.settings',
        'path': 'settings/app',
        'chunk': 'settings',
        'controller': 'LicenseCtrl',
        'templateUrl': 'pages/licenseInfo.html',
        'title': 'Current license for this location',
        'helpInfo': 'The GraphDB License Information view allows you to check the details of your current license. '
    }, {
        'url': '/alert-samples',
        'templateUrl': 'pages/alert-samples.html'
    }, {
        'url': '/toast-samples',
        'templateUrl': 'pages/toast-samples.html'
    }, {
        'url': '/loader-samples',
        'templateUrl': 'pages/loader-samples.html'
    }, {
        'url': '/loader-test',
        'module': 'graphdb.framework.settings',
        'path': 'settings/app',
        'chunk': 'settings',
        'controller': 'LoaderSamplesCtrl',
        'templateUrl': 'pages/loader-samples.html'
    }
]);
