/**
 * MarketKindController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    friendlyName:"kind",
    description:"大的分类",
    inputs:{
        id:{
            type:'string',
            required:true,
        },
        name:{
            type: 'string',
            required: false
        },
        routes:[
            {
                id:{
                    type:'string',
                    required: true,
                },
                msg:{
                    type:'string',
                    required: false
                },
                name:{
                    type:'string',
                    required: false
                },
                createdAt:{
                    type:'string',
                    required: false
                },
                updatedAt:{
                    type:'string',
                    required: false
                }
            }
        ],
        packages:[{
            id:{
                type:'string',
                required:true,
            },
            msg:{
                type: 'string',
                required: false
            },
            name:{
                type:'string',
                required: false
            },
            count:{
                type:'integer',
                required:false
            },
        }]
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
    findall:function (inputs, exits) {
        sails.models.marketkind.find()
            .exec(function (err, kinds) {
                if (err) return exits.badRequest({
                    code:"403",
                    msg:"查找分类过程中出错！"
                });
                return exits.ok({
                    code:"201",
                    msg:"查找成功",
                    data:kinds
                })
            })
    },
    findone:function (inputs, exits) {
        var id = inputs.query.id;
        if (!id){
            return exits.badRequest({
                code:"403",
                msg:"参数格式不正确（缺少分类的id）"
            })
        }
        sails.models.marketkind.find({id:id})
            .populate("routes")
            .populate("packages")
            .exec(function (err, kind) {
                if (err){
                    return exits.badRequest({
                        code:"403",
                        msg:"查找分类下的数据包和数据接口出错！"
                    })
                }
                return exits.ok({
                    code:"201",
                    msg:"查找API成功",
                    kind:kind[0]
                })
            })
    }
};

