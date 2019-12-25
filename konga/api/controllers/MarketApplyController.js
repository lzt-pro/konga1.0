/**
 * MarketApplyController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const uuidv4 = require('uuid/v4');
module.exports = {
    inputs:{
      id:{
          type:'string',
          required: false,
      },
      msg:{
          type: 'string',
          required: false
      },
      state:{
          type:"integer",
          required:false
      },
      fk_pack_id:{
          type:"integer",
          required:false
      },
      fk_user_id: {
          type:"integer",
          required:false
      }
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
        var apply = inputs.body;
        if (!apply.id){
            apply.id = uuidv4();
        }
        if (!apply.fk_user_id){
            return exits.badRequest({
                code:"403",
                msg:"参数当中没有用户ID"
            })
        }
        if (!apply.fk_pack_id){
            return  exits.badRequest({
                code:"403",
                msg:"参数当中没有API包ID"
            })
        }
        if (apply.state !== 0){
            return exits.badRequest({
                code:"403",
                msg:"参数中状态不正确"
            })
        }
        sails.models.marketapply.find({fk_pack_id:apply.fk_pack_id, fk_user_id:apply.fk_user_id})
            .exec(function (err, apply_r) {
                if (err) return exits.badRequest({
                    code:"403",
                    msg:"申请API包失败！"
                });
                if (apply_r.length !== 0){
                    return exits.ok({
                        code:"403",
                        msg:"该用户已经申请该包！",
                        data:apply_r[0]
                    });
                }
                sails.models.marketapply.create(apply)
                    .exec(function (err, apply) {
                        if (err) return exits.badRequest({
                            code:"403",
                            msg:"申请API包失败！"
                        });
                        return exits.created({
                            code:'201',
                            msg:"申请成功!",
                            data:apply
                        })
                    })

            });
    }
};

