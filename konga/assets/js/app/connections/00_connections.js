
(function() {
    'use strict';

    angular.module('frontend.connections', [
    ]);

    // Module configuration
    angular.module('frontend.connections')
        .config([
            '$stateProvider',
            function config($stateProvider) {
                $stateProvider
                    .state('connections', {
                        url: '/connections',
                        parent : 'frontend',
                        data : {
                            access : 0,
                            pageName : "Connections",
                            pageDescription : "Connections_detail",
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
