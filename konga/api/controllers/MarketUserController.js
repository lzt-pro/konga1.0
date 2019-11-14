var unirest = require("unirest");
var _ = require('lodash');
var KongService = require("../services/KongService");
var ProxyHooks = require("../services/KongProxyHooks");
var Utils = require('../services/Utils');
/**
 * MarketUserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var self = module.exports =  {

    send: function (entity, unirestReq, konga_extras, req, res) {

        // Clean up the mess
        // delete req.body.token;

        unirestReq.send(req.body);

        unirestReq.end(function (response) {
            if (response.error) {
                sails.log.error("KongProxyController", "request error", response.body);
                return res.negotiate(response);
            }


            // Apply after Hooks
            switch(req.method.toLowerCase()) {
                case "get":
                    return ProxyHooks.afterEntityRetrieve(entity, req, response.body, function (err, data) {
                        if(err) return res.badRequest(err);
                        return res.json(data);
                    });
                case "post":
                    return ProxyHooks.afterEntityCreate(entity, req, response.body, konga_extras || {}, function (err, data) {
                        if(err) return res.badRequest(err);
                        return res.json(data);
                    });
                case "delete":
                    return ProxyHooks.afterEntityDelete(entity,req,function (err) {
                        if(err) return res.badRequest(err);
                        return res.json(response);
                    });
                default:
                    return res.json(response.body)
            }


        });
    },

  register:function (req, res) {
      sails.log.debug("MarketUserController:req.method", req.method)
      sails.log.debug("MarketUserController:req.url", req.url)
      var entity = {
        username:req.body.email
      };
      var user = req.body;
      var email = req.body.email;
      var password = req.body.password;

      var request = unirest[req.method.toLowerCase()]("10.89.127.171:8001" + '/consumers');
      var konga_extras;
      if(req.body && req.body.extras) {
          konga_extras = req.body.extras;
          // Remove the correlations attribute so that we don't break the request to Kong.
          // If we need them later, they will be available in the `konga_extras` var
          delete req.body.extras;
      }
      request.headers(KongService.headers(req.connection, true));
      delete req.body.password_confirmation;
      switch (req.method.toLowerCase()) {
          case "post":
              return self.send(entity, request, konga_extras, req, res);
      }
  }
};

