/**
 * MarketRoutesPackages.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
module.exports = {
  schema: true,
  migrate: 'safe',
  autoPK : false,
  primaryKey:'id',
  tableName:'market_routes_packages',
  attributes: {
    id:{
      primaryKey:true,
      unique:true,
      type:'string',
      required:true
    },
    fk_route_id:{
      model: 'marketroutes'
    },
    fk_pack_id:{
      model: 'marketpackage'
    }
  },
};

