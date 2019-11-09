
(function() {
    'use strict';

    angular.module('frontend.dashboard', [
        'chart.js'
    ]);

    // Module configuration
    //路由的配置
    angular.module('frontend.dashboard',['pascalprecht.translate'])
        .config([
            '$stateProvider','$translateProvider',
            function config($stateProvider, $translateProvider) {
                $stateProvider
                    .state('dashboard', {
                        url: '/dashboard',
                        parent : 'frontend',
                        data : {
                            //activeNode : true,
                            //access: 1,
                            pageName : "Dashboard",
                            //displayName : "dashboard",
                            prefix : '<i class="material-icons text-primary">dashboard</i>'
                        },

                        views: {
                            'content@': {
                                templateUrl: 'js/app/dashboard/dashboard.html',
                                controller: 'DashboardController'
                            },

                        },

                    });
                $translateProvider.useStaticFilesLoader({
                    prefix:'/js/app/i18n/lan-',
                    suffix:'.json'
                });
                $translateProvider.preferredLanguage('cn');
        }]);
}());
