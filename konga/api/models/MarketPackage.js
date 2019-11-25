/**
 * MarketPackage.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  schema: true,
  migrate: 'safe',
  autoPK : false,
  primaryKey:'id',
  tableName:'market_package',
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
    msg:{
      type: 'string',
      required: false
    },
    count:{
      type:'integer',
      required:false
    },
    routes:{
      collection: 'marketroutespackages',
      via: 'fk_pack_id',
      through:'marketroutespackages'
    }
  },
};
