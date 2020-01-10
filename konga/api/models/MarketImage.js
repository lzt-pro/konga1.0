/**
 * MarketImage.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  schema: true,
  migrate: 'alter',
  autoPK : false,
  tableName:'market_image',
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
    data:{
      type: 'string',
      required: false
    },
    msg:{
      type: 'string',
      required: false
    },
    routes:{
      collection: "marketroutes",
      via: "fk_image",
    },
    packages:{
      collection: "marketpackage",
      via: "fk_image",
    }
  },
};

