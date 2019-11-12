
angular.module('frontend.plugins').filter('I18N',['$translate', function ($translate) {
    return function (key) {
        if (key){
            return $translate.instant(key);
        }
    }
}]);

angular.module('frontend.plugins').factory('I18N',['$translate', function ($translate) {
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

