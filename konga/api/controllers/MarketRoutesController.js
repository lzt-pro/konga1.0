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
           if (route !== null && kong_route !== null){
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
        MarketRouteService.delete(id, null,function (route, route_null) {
            return exits.ok({
                code:"201",
                msg:"路由删除成功",
                data:route
            });
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

