(function () {
  'use strict';

  angular.module('frontend.settings', []);

  // Module configuration
  angular.module('frontend.settings',['pascalprecht.translate'])
    .config([
      '$stateProvider','$translateProvider',
      function config($stateProvider,$translateProvider) {
          $translateProvider.useStaticFilesLoader({
              prefix:'/js/app/i18n/lan-',
              suffix:'.json'
          });
          $translateProvider.preferredLanguage('cn');
        $stateProvider
          .state('settings', {
            url: '/settings',
            parent: 'frontend',
            data: {
              access: 0,
              pageName: "Settings",
              displayName: "settings",
              prefix: '<i class="mdi mdi-settings"></i>'
            },
            views: {
              'content@': {
                templateUrl: 'js/app/settings/index.html',
                controller: 'SettingsController',
                resolve: {
                  _integrations : ['$http', function ($http) {
                    return $http.get('api/settings/integrations');
                  }]
                }

              }
            }
          })

      }
    ])
  ;
}());
