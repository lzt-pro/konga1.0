/**
 * MarketImageController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const uuidv4 = require('uuid/v4');
const fs = require('fs');
module.exports = {
    friendlyName:"图片",
    description:"图片相关",
    inputs:{
        id:{
            type:'string',
            required:true,
        },
        name:{
            type:'string',
            required:true,
        },
        data:{
            type:'string',
            required:true,
        },
        msg:{
            type:'string',
            required:true,
        },
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
        if (!inputs.body.data){
            return exits.badRequest({
                msg:"无法获取图片数据！"
            })
        }
        var entity = inputs.body;
        entity.id = uuidv4();
        sails.models.marketimage.create(entity)
            .exec(function (err, image) {
                if (err) return exits.forbidden({
                    msg:"上传图片出现错误！"
                });
                return exits.created({
                    msg:"图片上传成功！",
                    image:image
                })
            })
    },


    /*create_test:function (inputs, exits) {
        var entity = inputs.body;
        entity.id = uuidv4();
        let bitmap = fs.readFileSync('E:\\kong\\konga1.0\\konga\\assets\\images\\Image_Default.png');
        let base64str = Buffer.from(bitmap, 'binary').toString('base64'); // base64编码
        entity.data = base64str;
        sails.models.marketimage.create(entity)
            .exec(function (err, image) {
                if (err) return exits.forbidden({
                    msg:"上传图片出现错误！"
                });
                return exits.created({
                    msg:"图片上传成功！",
                    image:image
                })
            })
    }*/
};

