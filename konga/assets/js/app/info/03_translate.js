
angular.module('frontend.info').filter('I18N',['$translate', function ($translate) {
    return function (key) {
        if (key){
            return $translate.instant(key);
        }
    }
}]);

angular.module('frontend.info').factory('I18N',['$translate', function ($translate) {
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

