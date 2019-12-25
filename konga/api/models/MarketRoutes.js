/**
 * MarketRoutes.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  schema: true,
  migrate: 'safe',
  autoPK : false,
  tableName:'market_routes',
  primaryKey:'id',
  attributes: {
    id:{
      primaryKey: true,
      unique: true,
      type:'string',
      required: true,
    },
    name:{
      type:'string',
      required: false
    },
    msg:{
      type:'string',
      required: false
    },
    requests:{
      collection:'marketrequests',
      via:'fk_route_id'
    },
    responds:{
      collection: 'marketrespond',
      via: 'fk_route_id'
    },
    packages:{
      collection : 'marketpackage',
      via: 'fk_route_id',
      through:'marketroutespackages'
    },
    fk_kind:{
      model:'marketkind'
    }
  },
};

