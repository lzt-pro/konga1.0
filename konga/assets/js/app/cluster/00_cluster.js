
(function() {
    'use strict';

    angular.module('frontend.cluster', []);

    // Module configuration
    angular.module('frontend.cluster',['pascalprecht.translate'])
        .config([
            '$stateProvider','$translateProvider',
            function config($stateProvider,$translateProvider) {
                $translateProvider.useStaticFilesLoader({
                    prefix:'/js/app/i18n/lan-',
                    suffix:'.json'
                });
                $translateProvider.preferredLanguage('cn');
                $stateProvider
                    .state('cluster', {
                        parent: 'frontend',
                        url: '/cluster',
                        data : {
                            activeNode : true,
                            pageName : "Cluster",
                            // displayName : "node info",
                            // pageDescription : "Generic details about the node"
                        },

                        views: {
                            'content@': {
                                templateUrl: 'js/app/cluster/views/index.html',
                                controller: 'ClusterListController'
                            }
                        },

                    })
                ;
            }
        ])
    ;
}());
