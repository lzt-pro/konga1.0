/**
 * MarketPackageController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const uuidv4 = require('uuid/v4');
module.exports = {
    friendlyName:"package",
    description:"package创建相关",
    inputs:{
        id:{
            type:'string',
            required:true,
        },
        msg:{
            type: 'string',
            required: false
        },
        count:{
            type:'integer',
            required:false
        },
        routes:[
            {
                id:{
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

  //创建API服务包
  create:function (inputs, exits) {
        var pack = inputs.body;
        if (!pack.id){
            pack.id = uuidv4();
        }
        sails.models.marketpackage.create(pack)
            .exec(function (err, pack) {
                if (err) return exits.badRequest({
                    code:'403',
                    msg:'创建package失败！'
                });
                return  exits.created({
                    code:'201',
                    msg:'创建package成功',
                    data:pack
                })
            })
  },

  //查找该包下所有的路由
  findone:function (inputs, exits) {
        var id = inputs.query.id;
        var fk_user_id = inputs.query.user_id ? inputs.query.user_id : null;
        var pagesize = inputs.query.pagesize ? inputs.query.pagesize : 10;
        var pageindex = inputs.query.pageindex ? inputs.query.pageindex : 0;
      if(!id){
          return exits.badRequest({
              code:'404',
              msg:'没有获取到API包的ID'
          })
      }
      sails.models.marketpackage.find({where:{id:id},skip:(pageindex-1)*pagesize+1, limit:pagesize})
          .populate("routes")
          .exec(function (err, pack) {
              if (err){
                  return exits.badRequest({
                      code:"403",
                      msg:"查找API包当中的接口路由出错！"
                  })
              }
              return exits.ok({
                  code:"201",
                  msg:"查找API成功",
                  data:pack
              })
          })
  },

  //查找所有的包
  findall:function (inputs, exits) {
      var pagesize = inputs.query.pagesize;
      var pageindex = inputs.query.pageindex;
      if (!pagesize || !pageindex){
          exits.badRequest({
              code:"403",
              msg:"参数格式不正确（缺少分页）"
          })
      }
      sails.models.marketpackage.find({skip:(pageindex-1)*pagesize+1, limit:pagesize})
          .exec(function (err, packages) {
              if (err) return exits.badRequest({
                  code:"403",
                  msg:"查找包的过程出错！"
              });
              return exits.ok({
                  code:"201",
                  msg:"查找成功",
                  data:packages
              })
          })
  }
};

