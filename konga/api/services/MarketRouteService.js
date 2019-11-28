
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
                    sails.models.marketrequests.destroy(requests_ids === []?{id:{in : requests_ids}} : null)
                        .exec(function (err, request) {
                            if (err) return {
                                code:"403",
                                msg:"删除请求错误"
                            };
                            if(route[0].responds){
                                sails.models.marketrespond.destroy(responds_ids === []?{id:{in : responds_ids}} : null)
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
    }

};
module.exports = MarketRouteService;