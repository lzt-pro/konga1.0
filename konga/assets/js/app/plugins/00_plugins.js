(function () {
  'use strict';

  angular.module('frontend.plugins', []);

  // Module configuration
  angular.module('frontend.plugins',['pascalprecht.translate'])
    .config([
      '$stateProvider','$translateProvider',
      function config($stateProvider,$translateProvider) {
        $translateProvider.useStaticFilesLoader({
          prefix:'/js/app/i18n/lan-',
          suffix:'.json'
        });
        $translateProvider.preferredLanguage('cn');
        $stateProvider
          .state('plugins', {
            parent: 'frontend',
            url: '/plugins',
            data: {
              activeNode: true,
              pageName: "Plugins",
              pageDescription: "plugin_js_help_1",
              //displayName : "plugins",
              prefix: '<i class="material-icons text-primary">settings_input_component</i>'
            },
            views: {
              'content@': {
                templateUrl: 'js/app/plugins/plugins.html',
                controller: 'PluginsController'
              }
            }
          })
          .state('plugins.add', {
            url: '/add',
            params: {
              api: {}
            },
            data: {
              pageName: "Add Global Plugins",
              pageDescription: null,
              displayName: "add"
            },
            views: {
              'content@': {
                templateUrl: 'js/app/plugins/add-plugins.html',
                controller: 'AddPluginsController',
                resolve: {
                  _plugins: [
                    '$stateParams',
                    'PluginsService',
                    '$log',
                    function resolve(
                      $stateParams,
                      PluginsService,
                      $log
                    ) {
                      return PluginsService.load()
                    }
                  ],
                  _info: [
                    '$stateParams',
                    'InfoService',
                    '$log',
                    function resolve(
                      $stateParams,
                      InfoService,
                      $log
                    ) {
                      return InfoService.getInfo()
                    }
                  ],
                  _activeNode: [
                    'NodesService',
                    function resolve(NodesService) {

                      return NodesService.isActiveNodeSet()
                    }
                  ],
                }
              }
            },
          })
      }
    ])
  ;
}());
