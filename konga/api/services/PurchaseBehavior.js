
var unirest = require("unirest");
var KongService = require("../services/KongService");
var PurchaseBehavior = {
    //根据路由的Id获得所需的所有信息
    getInfoByRouteId: async function (req, res, routeId, cb) {

        var getData = async function ( url,  cb1) {
            unirest.get(url)
                .headers(KongService.headers(req, true))
                .end(function (response) {
                    if (response.error) return res.kongError(response)
                    sails.log.debug("获取kong内的值" + response.body.id);
                    return cb1(null, response.body)
                });
        };
            var url = sails.config.kong_admin_url + "/routes/" + routeId;
               getData(url,(err,data)=>{
                   return cb(null,data)
              });
    },
    //获取到路由的Id
    getinfoByconId: async function (req,res,conId, cb) {
        await sails.models.marketbind.find({consumerId: conId})
            .exec(function (err, entitys) {
                if (err) {
                    return res.serverError(err);
                }
                sails.log.debug('获得用户' + conId + "下面的路由id");
                return cb(null, entitys);
                //res.json(entitys.routeId)
            });

        // var getDate = function (entitys) {
        //     //依据获得的entitys数组，取出其中的routeId字段
        //     var routeId = [];
        //     entitys.forEach(function (entity) {
        //         routeId = routeId.concat({routeId: entity.routeId})
        //     })
        //     return routeId;
        // }
    }
}

module.exports = PurchaseBehavior;
