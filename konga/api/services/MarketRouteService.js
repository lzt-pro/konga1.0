const uuidv4 = require('uuid/v4');
var unirest = require("unirest");
var MarketRouteService = {
    delete:function (id, route_null ,next) {
        sails.models.marketroutes.find({id:id})
            .populate("requests")
            .populate("responds")
            .populate("packages")
            .exec(function (err, route) {
                if (err) return {
                    code:"403",
                    msg:"查询错误"
                };
                var requests = route[0].requests ? route[0].requests : [];
                var requests_ids = [];
                var pack_id = null;
                if (requests){
                    for (var i = 0; i < requests.length; i++){
                        requests_ids.push(requests[i].id)
                    }
                }
                var responds = route[0].responds ? route[0].responds : [];
                var responds_ids = [];
                if (responds){
                    for (var i = 0; i < responds.length; i++){
                        responds_ids.push(responds[i].id)
                    }
                }
                if (route[0].packages[0]){
                    pack_id = route[0].packages[0].id;
                }
                if (route[0].requests){
                    sails.models.marketrequests.destroy(requests_ids !== []?requests_ids : null)
                        .exec(function (err, request) {
                            if (err) return {
                                code:"403",
                                msg:"删除请求错误"
                            };
                            if(route[0].responds){
                                sails.models.marketrespond.destroy(responds_ids === []?responds_ids : null)
                                    .exec(function (err, respond) {
                                        if (err) return {
                                            code:"403",
                                            msg:"删除响应错误"
                                        };
                                        sails.models.marketroutes.destroy({id:route[0].id})
                                            .exec(function (err, respond) {
                                                if (err) return {
                                                    code:"403",
                                                    msg:"删除路由错误"
                                                };
                                                sails.models.marketroutespackages.destroy({fk_pack_id:pack_id})
                                                    .exec(function (err, market) {
                                                        if(err) return {
                                                          code:"403",
                                                          msg:"删除关联表错误"
                                                        };
                                                        next(route[0],route_null);
                                                    })
                                            })
                                    })
                            }
                        })
                }
            })
    },
    //在市场数据库当中新加条目
    create:function (route, next) {
        var requests = route.requests ? route.requests : [];
        var responds = route.responds ? route.responds : [];
        var packages = route.packages ? route.packages : [];
        var market_route = route.route;
        sails.models.marketroutes.find({id:market_route.id})
            .exec(function (err, found) {
                if (err) next(err);
                if (found.length) {
                    MarketRouteService.delete(market_route.id, market_route, function (route, route_null) {
                        sails.models.marketroutes.create(route_null)
                            .exec(function (err, route) {
                                if (err) next(err)
                                for (var i = 0; i < requests.length; i++) {
                                    requests[i].id = uuidv4();
                                    requests[i].fk_route_id = route.id;
                                }
                                sails.models.marketrequests.createEach(requests)
                                    .exec(function (err, requests) {
                                        if (err) next(err);
                                        for (var i = 0; i < responds.length; i++) {
                                            responds[i].id = uuidv4();
                                            responds[i].fk_route_id = route.id;
                                        }
                                        sails.models.marketrespond.createEach(responds)
                                            .exec(function (err, responds) {
                                                if (err) next(err);
                                                var route_package = [];
                                                for (var i = 0; i < packages.length; i++) {
                                                    route_package.push({
                                                        id: uuidv4(),
                                                        fk_route_id: route.id,
                                                        fk_pack_id: packages[i]
                                                    })
                                                }
                                                sails.models.marketroutespackages.createEach(route_package)
                                                    .exec(function (err, packages) {
                                                        if (err) next(err);
                                                        next(err,{
                                                            route: {
                                                                route: route,
                                                                requests: requests,
                                                                responds: responds,
                                                                packages: packages
                                                            }
                                                        });
                                                    })
                                            });
                                    })
                            })
                    })
                }else {
                    sails.models.marketroutes.create(market_route)
                        .exec(function (err, route) {
                            if (err) next(err);
                            for (var i = 0; i < requests.length; i++) {
                                requests[i].id = uuidv4();
                                requests[i].fk_route_id = route.id;
                            }
                            sails.models.marketrequests.createEach(requests)
                                .exec(function (err, requests) {
                                    if (err) next(err);
                                    for (var i = 0; i < responds.length; i++) {
                                        responds[i].id = uuidv4();
                                        responds[i].fk_route_id = route.id;
                                    }
                                    sails.models.marketrespond.createEach(responds)
                                        .exec(function (err, responds) {
                                            if (err) next(err);
                                            var route_package = [];
                                            for (var i = 0; i < packages.length; i++) {
                                                route_package.push({
                                                    id: uuidv4(),
                                                    fk_route_id: route.id,
                                                    fk_pack_id: packages[i]
                                                })
                                            }
                                            sails.models.marketroutespackages.createEach(route_package)
                                                .exec(function (err, packages) {
                                                    if (err) next(err);
                                                    next(null, {
                                                        route: {
                                                            route: route,
                                                            requests: requests,
                                                            responds: responds,
                                                            packages: packages
                                                        }
                                                    });
                                                })
                                        });
                                })
                        })
                }
            })
                },
};
module.exports = MarketRouteService;