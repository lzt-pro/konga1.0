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

        sails.log.debug('KongService: listAllCb', url);
        //获取数据，得到对应路由的acl插件的id
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
                        var i=0;
                        sails.log.debug('输出当前插件的名称'+apis[i].name+',插件个数是：'+apis.length);
                        for (var i=0,index=0;i<apis.length;i++){
                            if(apis[index.name=='acl']){
                                var index = i;
                            }
                        }
                        aclId=apis[index].id;
                        whitelist=apis[index].config.whitelist[0];
                        self.bindact(whitelist,consumerId,req,res)
                        sails.log.debug('acl group is '+whitelist);
                    }
                    return res.ok();
                });

        };
        getData([],`${url}`);


    },

    bindact: function (whitelist,consumerId,req,res) {
        //根据得到的acl ID与传入的consumerId对，对购买行为进行绑定
        var urlact = sails.config.kong_admin_url+"/consumers/"+consumerId+"/acls";
        //进行绑定操作
        unirest.post(urlact)
            .header(KongService.headers(req, true))
            .send({group:whitelist})
            .end(function (response) {
                if (response.error) return res.kongError(response)
                else sails.log.debug("绑定成功");
            });
    }
};

