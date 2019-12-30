
var unirest = require("unirest");
var MarketService = require("../services/MarketService");
var KongRouteService = {
    create:function (kong_route, next) {
        if (!kong_route.service) next({
            code:'403',
            error:'请求参数错误！'
        });
        var request = unirest['post'](sails.config.kong_admin_url + '/routes/');
        request.headers(MarketService.headers(true));
        request.send(kong_route);
        request.end(function (response) {
            if (response.error) {next(response)}
            else {
                next(response.error, response.body)
            }
        })
    }
};
module.exports = KongRouteService;