/**
 * MarketRoutesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const uuidv4 = require('uuid/v4');
module.exports = {
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
        notFound: {
            responseType: "notFound"
        },
        forbidden: {
            responseType:"forbidden"
        }
    },

    create : function (inputs, exits) {
        try {
           var requests = inputs.body.requests ? inputs.body.requests : [];
           var responds = inputs.body.responds ? inputs.body.responds : [];
           var route = inputs.body.route ? inputs.body.route:[];
           var packages = inputs.body.packages ? inputs.body.packages : [];
            sails.models.marketroutes.create(route)
                .exec(function (err, route) {
                    if (err) return exits.badRequest({
                        code:'403',
                        error:"插入路由的过程中出现错误"
                    });
                    for (var i = 0; i < requests.length; i++){
                        requests[i].id = uuidv4();
                        requests[i].fk_route_id = route.id;
                    }
                    sails.models.marketrequests.createEach(requests)
                        .exec(function (err, requests) {
                            if (err) return exits.badRequest({
                                code:'403',
                                error:'插入请求参数的过程中出现错误'
                            });
                            for (var i = 0; i < responds.length; i++){
                                responds[i].id = uuidv4();
                                responds[i].fk_route_id = route.id;
                            }
                            sails.models.marketrespond.createEach(responds)
                                .exec(function (err, responds) {
                                    if (err) return exits.badRequest({
                                        code:'403',
                                        error:"插入返回参数的过程中出现错误"
                                    });

                                    var route_package = [];
                                    for (var i = 0; i < packages.length; i++){
                                        route_package.push({
                                            id:uuidv4(),
                                            fk_route_id:route.id,
                                            fk_pack_id: packages[i]
                                        })
                                    }
                                    sails.models.marketroutespackages.createEach(route_package)
                                        .exec(function (err, packages) {
                                            if (err) return exits.badRequest({
                                                code:'403',
                                                error:"插入包的过程中出现错误"
                                            });
                                            return exits.created({
                                                code:'200',
                                                msg:'创建路由请求成功！',
                                                route:{
                                                    route:route,
                                                    requests:requests,
                                                    responds:responds,
                                                    packages:packages
                                                }
                                            })
                                        });
                                })
                        })
                })
        }catch (e) {
                sails.log.error(e.message);
                throw 'error';
        }
    }

};

