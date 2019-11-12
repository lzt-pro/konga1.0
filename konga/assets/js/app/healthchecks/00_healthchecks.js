(function () {
  'use strict';

  angular.module('frontend.healthchecks', []);

  // Module configuration
  angular.module('frontend.healthchecks',['pascalprecht.translate'])
    .config([
      '$stateProvider','$translateProvider',
      function config($stateProvider,$translateProvider) {
          $translateProvider.useStaticFilesLoader({
              prefix:'/js/app/i18n/lan-',
              suffix:'.json'
          });
          $translateProvider.preferredLanguage('cn');
        $stateProvider
          .state('healthchecks', {
            parent: 'frontend',
            url: '/healthchecks',
            data: {
              activeNode: true,
              pageName: "Health Checks",
              pageDescription: "Manage API healthchecks",
              prefix: '<i class="mdi mdi-heart"></i>'
            },
            views: {
              'content@': {
                templateUrl: 'js/app/healthchecks/healthchecks.html',
                controller: 'HealthChecksController'
              }
            }
          });
      }
    ])
  ;
}());
