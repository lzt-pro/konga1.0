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

    friendlyName:"Register User",
    description:"Register User",
    inputs:{
        id:{
            type:'string',
            required: true,
        },
        email:{
            type:'string',
            required: true,
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
      request.headers(MarketService.headers(true));
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
    logout:function (req, res){
        sails.log.debug("MarketUserController:req.method", req.method);
        res.cookie("User-token", null, {maxAge:-1});
        res.json({code:"200",msg:"用户注销成功！"})
    },
    test:function (req, res) {
        res.json({code:"200",msg:"验证通过",id:req.token})
    },
    key_auth:function (req, res) {
        var id = req.query.id;
        unirest.get(sails.config.kong_admin_url + '/consumers/' + id + "/key-auth")
            .headers(MarketService.headers(true))
            .end(function (response) {
                if (response.error) return res.kongError(response);
                return res.json(response.body);
            })
    }
};

