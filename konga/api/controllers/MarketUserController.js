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
    register:function (req, res) {
      sails.log.debug("MarketUserController:req.method", req.method);
      sails.log.debug("MarketUserController:req.url", req.url);
      sails.log.debug("Sails E:req.url", req.url);
      var entity = {
        username:req.body.email
      };
      var user = req.body;
      var email = req.body.email;
      var password = req.body.password;

      var request = unirest[req.method.toLowerCase()]("http://10.89.127.171:8001" + '/consumers');
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

          return res.json(response.body)
      })
  },
    create:function (req, res) {

    }
};

