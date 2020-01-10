/**
 * AdminTargetController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var unirest = require("unirest");
var MarketService = require("../services/MarketService");
module.exports = {
    //查询所有的目标服务器
    findall:function (req, res) {
        var request = unirest[req.method.toLowerCase()](sails.config.kong_admin_url + "/services/");
        sails.log.debug("AdminTargetController:method", req.method);
        sails.log.debug("AdminTargetController:url", req.url);
        request.end(function (response) {
            if (response.error){
                sails.log.error("AdminTargetController", "request error", response.body);
                return res.negotiate(response);
            }
            return res.ok(response.body)
        })
    },
    //查询指定目标服务器下的信息
    find:function (req, res) {
        var id = req.query.id;
        if (!id){
            return res.badRequest({
                code:"403",
                msg:"参数不规范，没有传入目标主机ID"
            })
        }
        var request = unirest[req.method.toLowerCase()](sails.config.kong_admin_url + "/services/" + id);
        sails.log.debug("AdminTargetController:method", req.method);
        sails.log.debug("AdminTargetController:url", req.url);
        request.end(function (response) {
            if (response.error) {
                sails.log.error("AdminNodeController", "request error", response.body);
                return res.negotiate(response);
            }
            return res.ok(response.body)
        })
    },
    //更新主机
    update:function (req, res) {
        var id = req.query.id;
        var entity = req.body;
        if (!id){
            return res.badRequest({
                code:"403",
                msg:"请求参数不正确，缺少ID"
            })
        }
        if ( !entity.name || !entity.protocol || !entity.host || !entity.port){
            return res.badRequest({
                code:"403",
                msg:"请求参数不正确"
            })
        }
        var request = unirest[req.method.toLowerCase()](sails.config.kong_admin_url + "/services/" + id);
        request.headers(MarketService.headers(req.connection, true));
        request.send(entity);
        sails.log.debug("AdminTargetController:method", req.method);
        sails.log.debug("AdminTargetController:url", req.url);
        request.end(function (response) {
            if (response.error){
                sails.log.error("AdminTargetController", "request error", response.body);
                return res.negotiate(response);
            }
            return res.ok(response.body)
        })
    },
    //创建服务
    create:function (req, res) {
        var entity = req.body;
        if ( !entity.name || !entity.protocol || !entity.host || !entity.port){
            return res.badRequest({
                code:"403",
                msg:"请求参数不正确"
            })
        }
        var request = unirest[req.method.toLowerCase()](sails.config.kong_admin_url + "/services/");
        sails.log.debug("AdminTargetController:method", req.method);
        sails.log.debug("AdminTargetController:url", req.url);
        request.headers(MarketService.headers(req.connection, true));
        request.send(entity);
        request.end(function (response) {
            if (response.error){
                sails.log.error("AdminTargetController", "request error", response.body);
                return res.negotiate(response);
            }
            return res.ok(response.body);
        })
    },
    delete:function (req, res) {
        var id = req.query.id;
        if (!id){
            return res.badRequest({
                code:"403",
                msg:"请求参数不正确，缺少ID"
            })
        }
        var request = unirest[req.method.toLowerCase()](sails.config.kong_admin_url + "/services/" + id);
        sails.log.debug("AdminTargetController:method", req.method);
        sails.log.debug("AdminTargetController:url", req.url);
        request.end(function (response) {
            if (response.error){
                sails.log.error("AdminTargetController", "request error", response.body);
                return res.negotiate(response);
            }
            return res.ok({
                code:"202",
                msg:"删除成功！"
            })
        })
    }
};

