
(function() {
    'use strict';

    angular.module('frontend.connections', [
    ]);

    // Module configuration
    angular.module('frontend.connections',['pascalprecht.translate'])
        .config([
            '$stateProvider','$translateProvider',
            function config($stateProvider,$translateProvider) {
                $translateProvider.useStaticFilesLoader({
                    prefix:'/js/app/i18n/lan-',
                    suffix:'.json'
                });
                $translateProvider.preferredLanguage('cn');
                $stateProvider
                    .state('connections', {
                        url: '/connections',
                        parent : 'frontend',
                        data : {
                            access : 0,
                            pageName : "Connections",
                            pageDescription : "Create connections to Kong Nodes and activate the one you want use.",
                            prefix : '<i class="mdi mdi-cast-connected"></i>'
                        },
                        views: {
                            'content@': {
                                templateUrl: 'js/app/connections/index.html',
                                controller: 'ConnectionsController'
                            },

                        }
                    })
            }
        ])
    ;
}());
