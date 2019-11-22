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
  attributes: {
    id:{
      primaryKey: true,
      unique: true,
      type:'string',
      required: true,
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
      collection : 'marketroutespackages',
      via: 'fk_route_id',
      through:'marketroutespackages'
    }
  },
};

