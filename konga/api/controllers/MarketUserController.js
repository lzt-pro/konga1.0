var unirest = require("unirest");
var _ = require('lodash');
var MarketService = require("../services/MarketService");
var ProxyHooks = require("../services/KongProxyHooks");
var Utils = require('../services/Utils');
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
            if (!err) return res.json(user);
            else return res.json({
                code:"404",
                err:err
            })
        })
    },
    test:function (req, res) {
        res.json({code:"200",msg:"验证通过"})
    }
};

