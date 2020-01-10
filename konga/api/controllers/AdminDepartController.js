/**
 * AdminDepartController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const uuidv4 = require('uuid/v4');
module.exports = {
    friendlyName:"部门",
    description:"对于管理员设定部门，用户API服务的追责和维护责任的认定",
    inputs:{
        id:{
            type:'string',
            required: false
        },
        name:{
            type:'string',
            required: false
        }
    },
    exist: {
        created: {
            responseType: 'created'
        },
        notFound: {
            responseType: "notFound"
        },
        forbidden: {
            responseType: "forbidden"
        },
    },

    create:function (inputs, exits) {
        if (!inputs.body.name){
            return exits.forbidden({
                code:"403",
                msg:"请求参数错误，缺少部门名称！"
            })
        }
        var entity = inputs.body;
        entity.id = uuidv4();
        sails.models.admindepart.findOne({name:inputs.body.name})
            .exec(function (err, depart) {
                if (err) return exits.forbidden({
                    code:"403",
                    msg:"查找部门失败！",
                    err:err
                });
                if (depart) return exits.forbidden({
                    code:"403",
                    msg:"部门名称重复！"
                })
                sails.models.admindepart.create(entity)
                    .exec(function (err, depart) {
                        if (err) return exits.forbidden({
                            msg:"新增部门出错！",
                            err:err
                        });
                        return exits.created({
                            msg:"新增部门成功！",
                            depart:depart
                        })
                    })
            })
    },
    find:function (inputs, exits) {
        var entity = {};
        var id = inputs.query.id;
        var name = inputs.query.name;
        if (!id && !name){
            sails.models.admindepart.find()
                .exec(function (err, departs) {
                    if (err) return exits.forbidden({
                        msg:"查询部门出错！",
                        err:err
                    });
                    return exits.ok({
                        code:"201",
                        data:departs
                    })
                })
        }else {
            if (id) entity.id = id;
            if (name) entity.name = name
            sails.models.admindepart.findOne(entity)
                .exec(function (err, depart) {
                    if (err) return exits.forbidden({
                        msg:"查询部门出错！",
                        err:err
                    });
                    if (!depart){
                        return exits.ok({
                            code:"201",
                            msg:"查询不到该部门",
                            data: depart
                        })
                    }
                    return exits.ok({
                        code:"201",
                        msg:"查询部门成功！",
                        data: depart
                    })
                })
        }
    }
};

