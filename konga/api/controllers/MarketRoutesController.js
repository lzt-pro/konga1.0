/**
 * MarketRoutesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var unirest = require("unirest");
var MarketRouteService = require("../services/MarketRouteService");
var KongRouteService = require("../services/KongRouteService");
const uuidv4 = require('uuid/v4');
var self = module.exports = {
    friendlyName:"routes",
    description:"编辑routes",
    inputs:{
        route:{
            id:{
                type:'string',
                required: true,
            },
            msg:{
                type:'string',
                required: false
            }
        },
        requests:[
            {
                id:{
                    type:'string',
                    required: false
                },
                name:{
                    type:'string',
                    required:false
                },
                kind:{
                    type:'string',
                    required:false
                },
                null:{
                    type:'boolean',
                    required:'false'
                },
                msg:{
                    type:'string',
                    required:false
                }
            }
        ],
        responds:[
            {
                id:{
                    type:'string',
                    required:false
                },
                name:{
                    type: 'string',
                    required: false
                },
                kind:{
                    type:'string',
                    required:false,
                },
                null:{
                    type:'boolean',
                    required:false
                },
                msg:{
                    type:'string',
                    required:false
                }
            }
        ],
        packages:[
            {
                id: {
                    type:'string',
                    required:true
                }
            }
        ]
    },
    exits:{
        created:{
            responseType: 'created'
        },
        ok:{
            responseType:'ok'
        },
        notFound: {
            responseType: "notFound"
        },
        forbidden: {
            responseType:"forbidden"
        }
    },
    //创建（更新）路由的功能
    create : function (inputs, exits) {
        try {
           var route = inputs.body.route;
           var kong_route = inputs.body.kong_route;
           var requests = route.requests ? route.requests : [];
           var responds = route.responds ? route.responds : [];
           if (route !== null && kong_route !== null){
               if (!route.route.name){
                   return exits.badRequest({
                       code:"403",
                       error: "请求错误！服务名称为空！"
                   })
               }
               if (!kong_route.methods){
                   return exits.badRequest({
                       code:"403",
                       error: "请求错误！请求方法为空！"
                   })
               }
               if (!kong_route.service){
                   return exits.badRequest({
                       code:"403",
                       error:"请求错误！数据源主机没有指定！"
                   })
               }
               for (i=0;i<requests.length;i++){
                    if (!route.requests[i].name){
                        return exits.badRequest({
                            code:"403",
                            error:"请求错误！请求参数字段名称没有指定！"
                        })
                    }
                    if (!route.requests[i].kind){
                        return exits.badRequest({
                            code:"403",
                            error:"请求错误！请求参数字段类型没有指定！"
                        })
                    }
                   if (!route.requests[i].kind){
                       return exits.badRequest({
                           code:"403",
                           error:"请求错误！请求参数字段能否为空没有指定！"
                       })
                   }
               }
               for (i=0;i<responds.length;i++){
                   if (!route.responds[i].name){
                       return exits.badRequest({
                           code:"403",
                           error:"请求错误！返回参数字段名称没有指定！"
                       })
                   }
                   if (!route.requests[i].kind){
                       return exits.badRequest({
                           code:"403",
                           error:"请求错误！返回参数字段类型没有指定！"
                       })
                   }
                   if (!route.requests[i].kind){
                       return exits.badRequest({
                           code:"403",
                           error:"请求错误！返回参数字段能否为空没有指定！"
                       })
                   }
               }
               KongRouteService.create(kong_route, function (err, kong_route_back) {
                   if (err) return exits.negotiate(err);
                   route.route.id = kong_route_back.id;
                   MarketRouteService.create(route, function (err, route_back) {
                       if (err) return exits.badRequest({
                           code:"403",
                           error:err
                       });
                       return exits.ok({
                           code:"201",
                           route:route_back,
                           kong_route:kong_route_back
                       })
                    });
               })
           }
        }catch (e) {
                sails.log.error(e.message);
                throw 'error';
        }
    },

    //查询该路由的详细信息（相当于API文档的功能）
    findone: function (inputs, exits) {
        var id = inputs.query.id;
        sails.models.marketroutes.find({id:id})
            .populate('requests')
            .populate('responds')
            .exec(function (err, route) {
                if (err) return exits.badRequest({
                    code:'403',
                    msg:'查询过程出现错误'
                });
                var request = unirest['get'](sails.config.kong_admin_url + '/routes/' + id);
                request.end(function (kong_route) {
                    if (kong_route.error) return exits.badRequest({
                        code:'403',
                        msg:'kong查询路由出错！',
                        data:kong_route.error
                    });
                    return exits.ok({
                        code:'201',
                        msg:'查询成功',
                        route:route[0],
                        kong:kong_route
                    })
                });
            })
    },

    //删除路由，连同所有的其他关联表都删除
    delete:function (inputs, exits) {
        var id = inputs.query.id;
        MarketRouteService.delete(id, null,function (route, route_null,error) {
            if (route.length !== 0){
                var request = unirest['delete'](sails.config.kong_admin_url + '/routes/' + id);
                request.end(function () {
                    return exits.ok({
                        code:"201",
                        msg:"路由删除成功",
                        data:route
                    });
                });
            }else {
                return exits.badRequest({
                    code:"403",
                    msg:"没有找到该路由",
                    data:route
                });
            }
        });
    },

    //查找所有的路由
    findall:function (inputs, exits) {
        sails.models.marketroutes.find()
            .exec(function (err, routes) {
                if (err) return exits.badRequest({
                    code:"403",
                    msg:"查询所有的路由过程出错！"
                });
                return exits.ok({
                   code:"201",
                   msg:"查询成功！",
                   routes:routes
                })
            })
    }
};

