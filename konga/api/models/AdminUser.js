/**
 * AdminUser.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  schema: true,
  migrate: 'safe',
  autoPK : false,
  tableName:'admin_user',
  attributes: {
    id:{
      primaryKey: true,
      unique: true,
      type:'string',
      required: true,
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
      email: true
    },
    fk_depart_id:{
      model:'admindepart'
    }
  },
};

