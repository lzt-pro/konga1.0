
(function() {
    'use strict';

    angular.module('frontend.dashboard', [
        'chart.js','pascalprecht.translate'
    ]);

    // Module configuration
    //路由的配置
    angular.module('frontend.dashboard')
        .config([
            '$stateProvider',
            function config($stateProvider) {
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

                    })
                ;
            }
        ]);

    angular.module('frontend.dashboard',['pascalprecht.translate'])
        .config(['$translateProvider',function ($translateProvider) {
            let lang;
            if(window.localStorage.lang === undefined || window.localStorage.lang === "undefined"){
                lang = 'ch'
            }else {
                lang = window.localStorage.lang;
            }
            $translateProvider.preferredLanguage(lang);
            $translateProvider.useStaticFilesLoader({
                prefix:"../i18n/",
                suffix:".json"
            });
        }]);

}());
