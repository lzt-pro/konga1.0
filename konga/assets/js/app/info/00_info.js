
(function() {
    'use strict';

    angular.module('frontend.info', []);

    // Module configuration
    angular.module('frontend.info',['pascalprecht.translate'])
        .config([
            '$stateProvider','$translateProvider',
            function config($stateProvider, $translateProvider) {

                $stateProvider
                    .state('info', {
                        parent: 'frontend',
                        url: '/info',
                        data : {
                            activeNode : true,
                            pageName : "Node Info",
                            access: 2, // Only admins can access this route
                            // displayName : "node info",
                            pageDescription : "Generic details about the node",
                            prefix : '<i class="material-icons text-primary">&#xE88F;</i>'
                        },

                        views: {
                            'content@': {
                                templateUrl: 'js/app/info/index.html',
                                controller: 'InfoController'
                            }
                        },

                    })
                ;
                $translateProvider.useStaticFilesLoader({
                    prefix:'/js/app/i18n/lan-',
                    suffix:'.json'
                });
                $translateProvider.preferredLanguage('cn');
            }
        ])
    ;
}());
