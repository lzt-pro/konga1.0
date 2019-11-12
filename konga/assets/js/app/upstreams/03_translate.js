
angular.module('frontend.upstreams').filter('I18N',['$translate', function ($translate) {
    return function (key) {
        if (key){
            return $translate.instant(key);
        }
    }
}]);

angular.module('frontend.upstreams').factory('I18N',['$translate', function ($translate) {
    var T = {
        T:function (key) {
            if (key){
                return $translate.instant(key)
            }
            return key
        }
    };
    return T;
}]);

