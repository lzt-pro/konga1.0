/**
 * AdminNodeController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var unirest = require("unirest");

module.exports = {
    inputs:{},
    exist:{},
    get:function (inputs, exits) {
        var request = unirest[inputs.method.toLowerCase()](sails.config.kong_admin_url);
        request.end(function (response) {
            if (response.error){
                sails.log.error("AdminNodeController", "request error", response.body);
                return res.negotiate(response);
            }
            return exits.ok(response.body)
        })
    }
  

};

