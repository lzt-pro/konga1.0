/**
 * AdminUserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const uuidv4 = require('uuid/v4');
var AdminService = require("../services/AdminService");
var AdminToken = require("../services/AdminToken");
var jwt = require('jsonwebtoken');
module.exports = {
    friendlyName:"API市场用户相关",
    description:"注册用户、登录、退出、查询用户API-KEY",
    inputs:{
        id:{
            type:'string',
            required: true
        },
        user:{
            type:'string',
            required: true
        },
        password:{
            type:'string',
            required: true
        },
        name:{
            type:'string',
            required: false
        },
        depart:{
            type:'string',
            required: false
        },
        idcard:{
            type:'string',
            required: false
        },
        iphone:{
            type:'string',
            required: false
        },
        email:{
            type:'string',
            required: false,
        }
    },
    exist:{
        created:{
            responseType: 'created'
        },
        notFound: {
            responseType: "notFound"
        },
        forbidden: {
            responseType:"forbidden"
        }
    },
    create : function (inputs, exits) {
        var entity = inputs.body;
        if (!entity || !entity.user || !entity.password) {
            return exits.badRequest({
                code: "403",
                msg: "请求参数不完整！"
            })
        }
        sails.models.adminuser.find({user:entity.user})
            .exec(function (err, user) {
                if (err) return  exits.negotiate(err);
                if (user.length === 1){
                    return exits.badRequest({
                        code:"403",
                        msg:"该用户名已经存在！"
                    })
                }
                var id = uuidv4();
                entity.id = id;
                sails.models.adminuser.create(entity)
                    .exec(function (err, user) {
                        if (err) return exits.negotiate(err);
                        return exits.ok({
                            code:"202",
                            msg:"管理员用户创建成功！",
                            data:user
                        })
                    })
            });
    },
    update:function (inputs, exits) {
        if (!inputs.body.id){
            return exits.badRequest({
                code:"403",
                msg:"请求参数缺少用户id！"
            });
        }
        sails.models.adminuser.find({id:inputs.body.id})
            .exec(function (err, users) {
                if (users.length === 0){
                    return exits.badRequest({
                        code:"403",
                        msg:"该用户不存在！"
                    })
                }
                sails.models.adminuser.update({id:inputs.body.id})
                    .set(inputs.body)
                    .exec(function (err, user) {
                        if (err) return exits.negotiate(err)
                        return exits.ok({
                            code:"203",
                            msg:"修改用户信息成功！",
                            data: user
                        })
                    })
            })
    },
    login:function (inputs, exits) {
        if (!inputs.body.user){
            return exits.badRequest({
                code:"403",
                msg:"缺少用户名！"
            })
        }
        if (!inputs.body.password){
            return exits.badRequest({
                code:"403",
                msg:"缺少密码！"
            })
        }
        AdminService.login(inputs.body,function (err, admin) {
            if (err) return exits.negotiate(err);
            exits.cookie("Admin-token", admin.token, {maxAge:((Date.now()/1000) +(60*60*24))});
            sails.log.debug("Cookie：" + inputs.headers.cookie);
            return exits.ok({
                code:"203",
                msg:"登录成功！",
                data:admin
            })
        })
    },
    logout:function (inputs, exits) {
        var id = inputs.query.id;
        var token = inputs.cookies['Admin-token'];
        jwt.verify(token, process.env.TOKEN_SECRET || "adminsecret",function (error, decode) {
            if (error) return exits.badRequest(error);
            if (id !== decode.data){
                return exits.badRequest({
                    code:"403",
                    msg:"该用户没登录！"
                })
            }
            try{
                exits.cookie("Admin-token", null, {maxAge:-1});
                exits.json({code:"200",msg:"用户注销成功！"})
            }catch (e) {
                throw e;
            }
        })
    }

};

