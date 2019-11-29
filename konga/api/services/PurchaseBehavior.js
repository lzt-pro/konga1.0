
var unirest = require("unirest");
var KongService = require("../services/KongService");
var PurchaseBehavior = {
    inputs:{
        consumerId:{
            type:'string',
            required: true,
        },
        routeId:{
            type:'string',
            required: true,
        },
        serviceId:{
            type:'string',
            required: true,
        },
        // serviceName:{
        //     type:'string',
        //     required: true,
        // },
        routeHost:{
            type:'string',
            required: true,
        },
        routeName:{
            type:'string',
            required: true,
        },
        status:{
            type:'int2',
            required: true,
        }

    },
    exits:{
        created:{
            responseType: 'created'
        },
        notFound: {
            responseType: "notFound"
        },
        forbidden: {
            responseType:"forbidden"
        }
    },
    create : async function(inputs, exits){
        try {
            let marketbind = await sails.models.marketbind.create(inputs);
            if (!marketbind || !marketbind.consumerId || !marketbind.routeId){
                return exits.badRequest({
                    code:"403",
                    msg:"创建审核关系失败"
                })
            }
            return exits.created({
                code:"201",
                msg:"创建审核关系成功",
                data:inputs
            })
        }catch (e) {
            console.log(e.message);
            throw 'error'
        }},
    deleteAudit : async function(inputs, exits){
        try {
                sails.models.marketbind.destroy({
                    where:{
                        consumerId:inputs.consumerId,
                        routeId:inputs.routeId,
                        status:0
                    }
                })
                    .exec(function (err, data) {
                        if (err) {
                           exits.serverError(err)
                        }
                        else if(data[0]!=null){
                            return exits.created({
                                code: "201",
                                msg: "该审核请求已删除",
                                data: data
                            })
                        }
                        else{
                            return exits.created({
                                code: "201",
                                msg: "该审核请求已批准，不可删除",
                                data: data
                            })
                        }
                    });
        }catch (e) {
            console.log(e.message);
            throw 'error'
        }},
    update : async function(inputs, exits){
        try {
            let marketbind = await sails.models.marketbind.update({
                where:{consumerId:inputs.consumerId,routeId:inputs.routeId,status:0}
            })
                .set({
                    status:1
                });
            return exits.created({
                code:"201",
                msg:"创建绑定关系成功",
                data:inputs
            })
        }catch (e) {
            console.log(e.message);
            throw 'error'
        }},
    //查找是否已存在consumer与route的关系，若存在则退出，若不存在，则创建
    finder : async function(inputs, exits){
        try {
            let marketbind = await sails.models.marketbind.find({
                where:{consumerId:inputs.consumerId,routeId:inputs.routeId},
            })
                .exec(function (err, data) {
                    if (data[0]==null) {
                         PurchaseBehavior.create(inputs,exits);
                    }
                    else {
                        return exits.created({
                            code: "403",
                            msg: "创建审核关系失败，已经申请该路由",
                            data: data
                        })
                    }
                });

        }catch (e) {
            console.log(e.message);
            throw 'error'
        }},
    getInfoUnaudit:function(consumerId,cb){
        if(consumerId!=null){
            sails.models.marketbind.find({
                where:{consumerId:consumerId,
                    status:0}
            })
                .exec(function (err, data) {
                    if (err) {
                        exits.serverError(err)
                    }
                    else{
                        return cb(null,data)
                    }
                });
        }else{
            sails.models.marketbind.find({
                where:{
                    status:0}
            })
                .exec(function (err, data) {
                    if (err) {
                        exits.serverError(err)
                    }
                    else{
                        return cb(null,data)
                    }
                });
        }

    },

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
    //根据用户Id获取该用户下的所有路由信息
    getinfoByconId: async function (req,res,conId, cb) {
        await sails.models.marketbind.find({where:{consumerId: conId,status:1}})
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
    },
    /**
     * 根据packageId查出所有的路由Id
     */
    getRouteIdsByPackageId:async function(req,res,packageId,cb){
        await sails.model.marketroutespackages.find({where:{fk_pack_id:packageId,state:0}})
            .exec(function (err,routesId) {
                if(err){
                    return res.serverError(err);
                }
                return cb(null,routesId);
            })
    },

    /**
     * 根据routeId，和consumerId获得whitelist字段
     */
    getWhitelistByrouteIdAndConsumerId:function (req,res,routeId,consumerId,cb) {
        sails.log.debug("routeId:"+routeId+"  consumerId:"+consumerId);
        var url =  sails.config.kong_admin_url+ "/routes/"+routeId+"/plugins";
        sails.log.debug('PurchaseBehaviorService: bind', url);
        var getData = function (previousData, url) {
            unirest.get(url)
                .headers(KongService.headers(req, true))
                .end(function (response) {
                    if (response.error) return res.kongError(response)
                    var apis = previousData.concat(response.body.data);
                    if (response.body.next) {
                        getData(apis, response.body.next);
                    }
                    else {
                        sails.log.debug('插件个数是：'+apis.length);
                        for (var i=0;i<apis.length;i++){
                            if(apis[i].name=='acl'){
                                var index = i;
                               var  aclId=apis[index].id;
                                var whitelist=apis[index].config.whitelist[0];
                                sails.log.debug('acl group is '+whitelist);
                                return cb(null,whitelist)
                            }
                        }
                    }
                });
        };
        getData([],`${url}`);
    }
}

module.exports = PurchaseBehavior;
