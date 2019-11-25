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
  findone:function (inputs, exits) {
        var id = inputs.query.id;
      if(!id){
          return exits.badRequest({
              code:'404',
              msg:'没有获取到API包的ID'
          })
      }
      sails.models.marketpackage.find({id:id})
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
  }
};

