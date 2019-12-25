/**
 * Marketkind.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  schema: true,
  migrate: 'safe',
  autoPK : false,
  primaryKey:'id',
  tableName:'market_kind',
  attributes: {
    id:{
      primaryKey:true,
      unique:true,
      type:'string',
      required:true,
    },
    name:{
      type: 'string',
      required: false
    },
    createdAt:{
      type:'string',
      required: false
    },
    updatedAt:{
      type:'string',
      required: false
    },
    routes:{
      collection:'marketroutes',
      via:'fk_kind'
    },
    packages:{
      collection:'marketpackage',
      via:'fk_kind'
    }
  },
};

