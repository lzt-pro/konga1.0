/**
 * PurchaseBehaviorController
 *
 * @description :: Server-side logic for managing Purchasebehaviors
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var unirest = require("unirest");
var KongService = require("../services/KongService");
var ProxyHooks = require("../services/KongProxyHooks");
var _ = require("lodash");
var Utils = require('../services/Utils');
const Kong = require("../services/KongService");
const async = require("async");
var PurchaseBe = require("../services/PurchaseBehavior");
var events = require("events");



var self = module.exports = {
    friendlyName: 'Purchase Behavior',

    description: 'Purchase Behavior',

    /**
     *根据whitelist字段给消费者添加分组
     */
    bind:function (req,res) {
        var whitelist='demo';
        var aclId;
        sails.log.debug("这是测试bind方法"),
            req.url = req.url.replace('/api-platform/v1/bind/', '');
        var routeId=req.body.routeId;
        var consumerId=req.body.consumerId;
        sails.log.debug("routeId:"+routeId+"  consumerId:"+consumerId);
        var url =  sails.config.kong_admin_url+ "/routes/"+routeId+"/plugins";
        //var request = unirest["GET"](req.connection.kong_admin_url + "/plugins/"+routeId);
        sails.log.debug('PurchaseBehaviorService: bind', url);
        //获取数据，得到对应路由的acl插件的id
        var getData = function (previousData, url,callback) {
            var flag=0;
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
                        for (var i=0,index=0;i<apis.length;i++){
                            if(apis[i].name=='acl'){
                                var index = i;
                                aclId=apis[index].id;
                                whitelist=apis[index].config.whitelist[0];
                                callback(routeId,whitelist,consumerId,req,res)
                                sails.log.debug('acl group is '+whitelist);
                            }
                        }
                    }
                });
        };
        getData([],`${url}`,self.bindact);

    },

    bindact: function (routeId,whitelist,consumerId,req,res) {
        //根据得到的acl ID与传入的consumerId对，对购买行为进行绑定
        var urlact = sails.config.kong_admin_url+"/consumers/"+consumerId+"/acls";
        //进行绑定操作
        unirest.post(urlact)
            .header(KongService.headers(req, true))
            .send({group:whitelist})
            .end(function (response) {
                if (response.error)
                {
                     res.created({
                         code:"409",
                         msg:"当前用户已经与该服务绑定"});
                }
                else {sails.log.debug("绑定成功");
                    PurchaseBe.getInfoByRouteId(req,res,routeId,(err,data)=>{
                        if(err){
                            return res.serverError(err);
                        }else {
                            PurchaseBe.update({
                                consumerId:consumerId,
                                routeId:routeId,
                                serviceId:data.service.id,
                                status:1,
                                //serviceName:data.service,
                                routeName:data.name,
                                routeHost:data.hosts,
                        },res)
                        }
                    })
                }
            });
    },
    /**
     * 审核操作
     * 前端提交consumerId与routeId,同时只记录，不绑定状态值设为0
     */
    putAudit:function(req,res){
            var consumerId = req.body.consumerId;
            var routeId=req.body.routeId;

             PurchaseBe.getInfoByRouteId(req,res,routeId,(err,data)=>{
            if(err){
                return res.serverError(err);
            }else {
                PurchaseBe.finder({
                    consumerId:consumerId,
                    routeId:routeId,
                    serviceId:data.service.id,
                    status:0,
                    //serviceName:data.service,
                    routeName:data.name,
                    routeHost:data.hosts,
                },res)
            }
        })
    },
    deleteAudit:function(req,res){
        var consumerId = req.body.consumerId;
        var routeId=req.body.routeId;
        PurchaseBe.getInfoByRouteId(req,res,routeId,(err,data)=>{
            if(err){
                return res.serverError(err);
            }else {
                PurchaseBe.deleteAudit({
                    consumerId:consumerId,
                    routeId:routeId,
                    status:0
                },res)
            }
        })
    },
    // /**
    //  * 根据包的ID绑定
    //  */
    // bindByPacId(req,res){
    //     var consumerId = req.body.consumerId;
    //     var packageId = req.body.packageId;
    //     //根据packageId查出该包下的所有routeId,并进行绑定操作
    //     PurchaseBe.getRouteIdsByPackageId(req,res,packageId,(err,routesId)=>{
    //         routesId.forEach(function (routeId) {
    //             self.bindByConsumerIdAndRouteId(req,res,consumerId,routeId,packageId,(err,flag)=>{
    //                 if(flag==0){
    //                     res.create({
    //                         msg:'该包绑定完成'
    //                     })
    //                 }
    //             })
    //         })
    //     })
    // },
    // bindByConsumerIdAndRouteId:function(req,res,consumerId,routeId,packageId,cb){
    //     PurchaseBe.getWhitelistByrouteIdAndConsumerId(req,res,routeId,consumerId,(err,whitelist)=>{
    //         var urlact = sails.config.kong_admin_url+"/consumers/"+consumerId+"/acls";
    //         unirest.post(urlact)
    //             .header(KongService.headers(req, true))
    //             .send({group:whitelist})
    //             .end(function (response) {
    //                 if (response.error)
    //                 {
    //                     return cb(err,0)
    //                 }
    //                 else {
    //                    // sails.model.marketapply.update({where:{fk_pack_id:packageId,fk_user_id:consumerId}})
    //                    //     .set({
    //                    //         state:1
    //                    //     })
    //                     return cb(null,1);
    //                 }
    //             });
    //     })
    // },
    /**
     * 用户与路由ACL插件解绑
     * @param req
     * @param res
     */
    rebind:function (req,res) {
        sails.log.debug("这是测试rebind方法"),
            req.url = req.url.replace('/api-platform/v1/bind/', '');
        var routeId=req.body.routeId;
        var consumerId=req.body.consumerId;
        sails.log.debug("routeId:"+routeId+"  consumerId:"+consumerId);

        var url =  sails.config.kong_admin_url+ "/consumers/"+consumerId+"/acls";
        sails.log.debug('PurchaseBehaviorService: rebind-findAllAclsByconsumerId', url);
        //根据消费者id查询该消费者所有的acl插件字段
        var getAclByconsumerId = function (previousData, url,callback) {
            unirest.get(url)
                .headers(KongService.headers(req, true))
                .end(function (response) {
                    if (response.error) return res.kongError(response)
                    var apis = previousData.concat(response.body.data);
                    if (response.body.next) {
                        getAclByconsumerId(apis, response.body.next);
                    }
                    else {
                        sails.log.debug('当前消费者绑定的ACL插件个数是：'+apis.length);
                    }
                     var urlgroup =  sails.config.kong_admin_url+ "/routes/"+routeId+"/plugins";
                    callback(req,res,routeId,[],urlgroup,apis,consumerId,self.rebindact);
                    //sails.log.debug('groupName传递过来了');


                });
        };
        getAclByconsumerId([],`${url}`,self.getGroupByrouteId);
    },
    //根据路由id获得该路由下面的ACL插件内group字段
    getGroupByrouteId :function (req,res,routeId,previousData, url,apis,consumerId,callback) {

        sails.log.debug('进入getGroupByrouteId函数，根据路由id获得该路由下面的ACL插件内group字段')
        unirest.get(url)
            .headers(KongService.headers(req, true))
            .end(function (response) {
                if (response.error) return res.kongError(response)
                var apis1 = previousData.concat(response.body.data);
                if (response.body.next) {
                    getGroupByrouteId(req,res,apis1, response.body.next);
                }
                else {
                    sails.log.debug('当前路由的插件个数是：'+apis.length);
                    for (var i=0,index=-1;i<apis1.length;i++){
                        if(apis1[i].name=='acl'){
                            index = i;
                        }
                    }
                    //var aclId=apis1[index].id;
                    var groupName=apis1[index].config.whitelist[0];
                    sails.log.debug('得到的groupName为：'+groupName);
                    for (var i=0;i<apis.length;i++){
                        if(apis[i].group==groupName){
                            var consumerAclId = apis[i].id;
                            callback(routeId,consumerId,consumerAclId,req,res);
                            break;
                        }else if(i==apis.length-1&&apis[i].group!=groupName){
                            sails.log.debug('当前用户未购买该服务');
                            res.created({
                                code:"409",
                                msg:"当前用户未购买该服务"});

                        }
                    }
                }
            });

    },
    //执行删除操作
    rebindact:function (routeId,consumerId,consumerAclId,req,res) {
        //根据得到的consumerId,与consumerAclId,对消费者上面的acl插件进行解绑
        sails.log.debug('进入rebindact函数，解绑功能区');
        var urlact = sails.config.kong_admin_url+"/consumers/"+consumerId+"/acls/"+consumerAclId;
        //进行解绑操作
        unirest.delete(urlact)
            .header(KongService.headers(req, true))
            .end(function (response) {
                if (response.error) return res.kongError(response)
                else {sails.log.debug("解绑成功");
                    sails.models.marketbind.destroy({
                        where:{consumerId: consumerId,routeId: routeId,status:1}
                    }).exec(function (err,data){
                        if (err) {
                            return res.negotiate(err);
                        }
                        sails.log.debug('Deleted book with `id: 4`, if it existed.');
                        res.created({
                            code:"201",
                            msg:"解除绑定关系成功",
                            data:data
                        })
                    });

                }
            });
    },

    /**
     * 根据用户ID，获得所有与该用户绑定的路由和信息
     */
    getInfoByConsumerId: async function (req,res) {
        var conId = req.query.consumerId;
        sails.log.debug('获得的用户id:'+conId);
        //根据用户Id，查询该用户名下的简易路由信息
       await PurchaseBe.getinfoByconId(req,res,conId,(err,data)=>{
                 res.created({
                     code:"201",
                     msg:"查询成功",
                     data:data
                 })
        })

    }

};