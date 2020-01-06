var unirest = require("unirest");
var cookie = require("cookie");
var _ = require('lodash');
var MarketService = require("../services/MarketService");
var ProxyHooks = require("../services/KongProxyHooks");
var Utils = require('../services/Utils');
var cookieParser = require('cookie-parser');
/**
 * MarketUserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var self = module.exports =  {
    friendlyName:"API市场用户相关",
    description:"注册用户、登录、退出、查询用户API-KEY",
    inputs:{
        id:{
            type:'string',
            required: false,
        },
        email:{
            type:'string',
            required: false,
        },
        phone:{
            type:'string',
            required: false
        },
        idcard:{
            type:'string',
            required: false,
        },
        password:{
            type:'string',
            required:true,
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
    //调用Kong的API去创建用户（前端调用的是这个）
    create : async function(inputs, exits){
        try {
            let user = await sails.models.marketuser.create(inputs);
            if (!user || !user.password || !user.email){
                return exits.badRequest({
                    code:"403",
                    msg:"创建用户失败"
                })
            }
            var request = unirest['post'](sails.config.kong_admin_url + '/consumers/' + user.id + "/key-auth");
            await  request.end(function (response, key_auth) {
                if(response.error){
                    sails.log.error("KongProxyController", "request error", response.body);
                    return exits.negotiate(response);
                }
                key_auth = response.body;
                return key_auth;
            });
            return exits.created({
                code:"201",
                msg:"创建用户成功",
                data:inputs
            })
        }catch (e) {
            console.log(e.message);
            throw 'error'
        }},

    //在自建表market_user当中创建用户
    register:function (req, res) {
      sails.log.debug("MarketUserController:req.method", req.method);
      sails.log.debug("MarketUserController:req.url", req.url);
      sails.log.debug("Sails E:req.url", req.url);
      var entity = {
        username:req.body.email
      };
      var user = req.body;
      var request = unirest[req.method.toLowerCase()](sails.config.kong_admin_url + '/consumers');
      var konga_extras;
      if(req.body && req.body.extras) {
          konga_extras = req.body.extras;
          // Remove the correlations attribute so that we don't break the request to Kong.
          // If we need them later, they will be available in the `konga_extras` var
          delete req.body.extras;
      }
      request.headers(MarketService.headers(req.connection, true));
      request.send(entity);
      delete req.body.password_confirmation;
      request.end(function (response) {
          if(response.error){
              sails.log.error("KongProxyController", "request error", response.body);
              return res.negotiate(response);
          }
          user.id = response.body.id;
          self.create(user, res);
          return response.body;
      });
  },

    //用户登录
    login:function (req, res) {
        sails.log.debug("MarketUserController:req.method", req.method);
        MarketService.login(req, res, function (err, user) {
            if (!err) {
                res.cookie("User-token", user, {maxAge:((Date.now()/1000) +(60*60*24))});
                sails.log.debug("Cookie：" + req.headers.cookie);
                return res.json(user);
            }
            else {
                return res.json({
                    code:"404",
                    err:err
                })
            }
        })
    },

    //用户退出
    logout:function (req, res){
        sails.log.debug("MarketUserController:req.method", req.method);
        try{
            res.cookie("User-token", null, {maxAge:-1});
            res.json({code:"200",msg:"用户注销成功！"})
        }catch (e) {
            throw e;
        }
    },

    //测试，实际当中不使用
    test:function (req, res) {
        res.json({code:"200",msg:"验证通过",id:req.token})
    },

    //查找指定用户的API-KEY
    key_auth:function (req, res) {
        var id = req.query.id;
        unirest.get(sails.config.kong_admin_url + '/consumers/' + id + "/key-auth")
            .headers(MarketService.headers(true))
            .end(function (response) {
                if (response.error) return res.kongError(response);
                return res.json(response.body);
            })
    },

    //查找指定用户的信息
    findOne:function (inputs, exits) {
        var id = inputs.query.id;
        sails.models.marketuser.find({id:id})
            .exec(function (err, user) {
                if (err) return exits.ok({
                    code:"403",
                    msg:"查询用户信息失败！"
                });
                unirest.get(sails.config.kong_admin_url + '/consumers/' + id + "/key-auth")
                    .headers(MarketService.headers(true))
                    .end(function (response) {
                        if (response.error) return exits.badRequest({
                            code:"403",
                            msg:"查询用户API-KEY失败！"
                        });
                        user[0].api_key = response.body.data[0].key;
                        return exits.ok({
                            code:"201",
                            msg:"查询成功",
                            data:user[0]
                        });
                    })
            })
    },

    //更新用户的信息
    update:function (inputs, exits) {
        if (!inputs.body.id){
            return exits.badRequest({
                code:"403",
                msg:"没有获得用户ID！"
            });
        }
        sails.models.marketuser.update(inputs.body.id)
            .set(inputs.body)
            .exec(function (err, user) {
                if (err) return exits.badRequest({
                    code:"403",
                    msg:"更新用户信息错误！"
                });
                return  exits.ok({
                    code:"201",
                    msg:"更新用户信息成功！",
                    data:user
                })
            })
    },

    //查找所有的用户
    findall:function (inputs, exits) {
        var pagesize = inputs.query.pagesize;
        var pageindex = inputs.query.pageindex;
        if (!pagesize || !pageindex){
            exits.badRequest({
                code:"403",
                msg:"参数格式不正确（缺少分页）"
            })
        }
        sails.models.marketuser.find({skip:(pageindex-1)*pagesize+1, limit:pagesize})
            .exec(function (err, user) {
                if (err) return exits.badRequest({
                    code:"403",
                    msg:"查询用户过程出错！"
                });
                return exits.ok({
                    code:"201",
                    msg:"查询所有用户成功！",
                    data:user
                })
            })
    }
};

