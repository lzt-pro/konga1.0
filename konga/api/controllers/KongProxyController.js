/**
 * RemoteApiController
 */

var unirest = require("unirest");
var KongService = require("../services/KongService");
var MarketRouteService = require("../services/MarketRouteService");
var ProxyHooks = require("../services/KongProxyHooks");
var _ = require("lodash");
var Utils = require('../services/Utils');


function getEntityFromRequest(req) {
  if(!req.path) return null;
  return req.path.replace('/kong', '').split("/").filter(function (e) {
    return e;
  })[0];
}

var self = module.exports = {


  /**
   * Proxy requests to native Kong Admin API
   * @param req
   * @param res
   */
  proxy: function (req, res) {

    req.url = req.url.replace('/kong', ''); // Remove the /kong prefix
    var entity = getEntityFromRequest(req);

    //打印请求的方法、路径、实体
    sails.log.debug("KongProxyController:req.method", req.method)
    sails.log.debug("KongProxyController:req.url", req.url)
    sails.log.debug("KongProxyController:entity", entity)


    // Fix update method by setting it to "PATCH" as Kong requires
    if (req.method.toLowerCase() === 'put') {
      req.method = "PATCH";
    }


    if (!req.connection) {
      return res.badRequest({
        message: 'No Kong connection is defined'
      });
    }

    sails.log("Kong admin url =>", req.connection.kong_admin_url);

    var request = unirest[req.method.toLowerCase()](req.connection.kong_admin_url + req.url)

    // Assign Konga correlations to a var if set in the request
    var konga_extras;
    if(req.body && req.body.extras) {
      konga_extras = req.body.extras;
      // Remove the correlations attribute so that we don't break the request to Kong.
      // If we need them later, they will be available in the `konga_extras` var
      delete req.body.extras;
    }

    // Set the appropriate request headers
    request.headers(KongService.headers(req.connection, true))

    // Apply monkey patches
    if (['post', 'put', 'patch'].indexOf(req.method.toLowerCase()) > -1) {

      if (req.body && req.body.orderlist) {
        for (var i = 0; i < req.body.orderlist.length; i++) {
          try {
            req.body.orderlist[i] = parseInt(req.body.orderlist[i])
          } catch (err) {
            return res.badRequest({
              body: {
                message: 'Ordelist entities must be integers'
              }
            });
          }
        }
      }
    }
    /**
     * unirest函数用法
     * .headers 发送头部信息
     * send 是指发送json数据或者entity实体
     * end是指发送响应，发送请求
     */
    // Apply before Hooks
    switch(req.method.toLowerCase()) {
      case "patch":
        return ProxyHooks.beforeEntityUpdate(entity, req.param("id"), req.connection.id, _.merge(req.body,{extras: konga_extras}), function (err, data) {
          if(err) return res.badRequest(err);
          req.body = data; // Assign the resulting data to req.body
          return self.send(entity, request, konga_extras, req, res)
        });
      default:
        return self.send(entity, request, konga_extras,  req, res);
    }

  },


  /**
   * All GET methods to Kong will be using this methods
   * starting from Kong 1.x due to Kong's limitations on listing size
   * @param req
   * @param res
   */
  listProxy: (req, res) => {
    req.url = req.url.replace('/kong', ''); // Remove the /kong prefix
    const entity = req.params.entity;

    sails.log.debug("KongProxyController:listAllEntityRecords:req.method 这是GET方法", req.method)
    sails.log.debug("KongProxyController:listAllEntityRecords:req.url 这是GET方法", req.url)
    sails.log.debug("KongProxyController:listAllEntityRecords:entity 这是GET方法", entity)

    KongService.listAllCb(req, req.url, (err, data) => {
      if(err) return res.negotiate(err);
      return res.json(data);
    })
  },

  /**
   * Actually send the request to Kong
   * @param entity
   * @param unirestReq
   * @param konga_extras
   * @param req
   * @param res
   * 这里是给Kong发送请求
   */
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
            if (entity === 'routes'){
              var route_id = response.body.id;
              if (route_id){
                sails.models.marketroutes.create({id:route_id})
                    .exec(function (err, route) {
                      if(err) return res.badRequest(err);
                      sails.log.debug('成功创建' + route.id + "路由")
                    })
              }
            }
            return res.json(data);
          });
        case "delete":
          return ProxyHooks.afterEntityDelete(entity,req,function (err) {
            if(err) return res.badRequest(err);
            if (entity === 'consumers'){
              user_id = req.url.split('/')[2];
              sails.models.marketuser.destroy({id:req.url.split('/')[2]})
                  .exec(function (err, user) {
                    if(err) return res.negotiate(err);
                    user = user_id;
                    sails.log.debug("成功删除了" + user + "用户");
                    return res.json(response);
                  });
            }
            if (entity === 'routes'){
              route_id = req.url.split('/')[2];
              MarketRouteService.delete(route_id, null,function (route, ruote_null) {
                return res.json(response);
              })
            }
          });
        default:
          return res.json(response.body)
      }
    });
  }
};